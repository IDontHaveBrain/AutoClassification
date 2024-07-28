package cc.nobrain.dev.userserver.domain.sse.handler

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.annotation.PostConstruct
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Sinks
import reactor.core.scheduler.Schedulers
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import org.slf4j.LoggerFactory
import java.util.*

@Component
class SseHandler(private val objectMapper: ObjectMapper) {
    private val logger = LoggerFactory.getLogger(SseHandler::class.java)
    private val userConnections = ConcurrentHashMap<String, MutableSet<Sinks.Many<ServerSentEvent<String>>>>()
    private val groupConnections = ConcurrentHashMap<Long, MutableSet<String>>()
    private val messageQueue = ConcurrentHashMap<String, ArrayDeque<SseMessageDto>>()
    private val lastActivityTime = ConcurrentHashMap<String, ConcurrentHashMap<UUID, Instant>>()
    private val MAX_QUEUE_SIZE = 100
    private val CONNECTION_TIMEOUT = Duration.ofMinutes(30)
    private val CLEANUP_INTERVAL = Duration.ofMinutes(3)
    private val HEARTBEAT_INTERVAL = Duration.ofSeconds(30)

    @PostConstruct
    fun init() {
        Flux.interval(CLEANUP_INTERVAL)
            .publishOn(Schedulers.boundedElastic())
            .subscribe { cleanupInactiveConnections() }

        Flux.interval(HEARTBEAT_INTERVAL)
            .publishOn(Schedulers.boundedElastic())
            .subscribe { sendHeartbeat() }
    }

    fun subscribe(userId: String, groupId: Long): Flux<ServerSentEvent<String>> {
        val sink = Sinks.many().multicast().onBackpressureBuffer<ServerSentEvent<String>>()
        val connectionId = UUID.randomUUID()
        userConnections.computeIfAbsent(userId) { ConcurrentHashMap.newKeySet() }.add(sink)
        lastActivityTime.computeIfAbsent(userId) { ConcurrentHashMap() }[connectionId] = Instant.now()

        if (groupId != 0L) {
            groupConnections.computeIfAbsent(groupId) { ConcurrentHashMap.newKeySet() }.add(userId)
        }

        logger.info("User $userId subscribed (Connection ID: $connectionId)" + if (groupId != 0L) " to group $groupId" else "")

        return Flux.create { emitter ->
            val initialEvent = ServerSentEvent.builder<String>()
                .id("initial")
                .event("INITIAL")
                .data("Connection established")
                .build()
            emitter.next(initialEvent)

            sendQueuedMessages(userId)

            sink.asFlux()
                .doOnCancel {
                    removeConnection(userId, groupId, connectionId)
                    emitter.complete()
                }
                .doOnError { error ->
                    logger.error("Error in SSE stream for user $userId (Connection ID: $connectionId)" + if (groupId != 0L) " in group $groupId" else "" + ": ${error.message}")
                    removeConnection(userId, groupId, connectionId)
                    emitter.error(error)
                }
                .subscribe(
                    { event -> emitter.next(event) },
                    { error -> emitter.error(error) },
                    { emitter.complete() }
                )
        }
    }

    fun sendEvent(userId: String, event: SseMessageDto) {
        val sinks = userConnections[userId]
        if (sinks != null && sinks.isNotEmpty()) {
            val serverSentEvent = ServerSentEvent.builder<String>()
                .id(event.id ?: "")
                .data(objectMapper.writeValueAsString(event))
                .build()

            sinks.forEach { sink ->
                val result = sink.tryEmitNext(serverSentEvent)
                if (result.isSuccess) {
                    lastActivityTime[userId]?.values?.forEach { it.plusSeconds(0) } // Update last activity time for all connections
                    logger.debug("Event sent to user $userId: ${event.type}")
                } else {
                    logger.warn("Failed to send event to user $userId, queueing message")
                    queueMessage(userId, event)
                }
            }
        } else {
            logger.warn("User $userId not connected, queueing message")
            queueMessage(userId, event)
        }
    }

    fun sendGroupEvent(groupId: Long, event: SseMessageDto) {
        if (groupId != 0L) {
            groupConnections[groupId]?.forEach { userId ->
                sendEvent(userId, event)
            }
            logger.debug("Group event sent to group $groupId: ${event.type}")
        }
    }

    private fun queueMessage(userId: String, event: SseMessageDto) {
        val queue = messageQueue.computeIfAbsent(userId) { ArrayDeque() }
        queue.addLast(event)
        if (queue.size > MAX_QUEUE_SIZE) {
            queue.removeFirst()
            logger.warn("Message queue for user $userId exceeded max size, oldest message removed")
        }
    }

    private fun sendQueuedMessages(userId: String) {
        messageQueue[userId]?.let { messages ->
            messages.forEach { event -> sendEvent(userId, event) }
            messageQueue.remove(userId)
            logger.debug("Sent ${messages.size} queued messages to user $userId")
        }
    }

    fun broadcastEvent(event: SseMessageDto) {
        userConnections.keys.forEach { userId ->
            sendEvent(userId, event)
        }
        logger.debug("Broadcast event sent: ${event.type}")
    }

    private fun removeConnection(userId: String, groupId: Long, connectionId: UUID) {
        userConnections[userId]?.removeIf { it.currentSubscriberCount() == 0 }
        if (userConnections[userId]?.isEmpty() == true) {
            userConnections.remove(userId)
        }
        lastActivityTime[userId]?.remove(connectionId)
        if (lastActivityTime[userId]?.isEmpty() == true) {
            lastActivityTime.remove(userId)
        }
        if (groupId != 0L) {
            groupConnections[groupId]?.remove(userId)
            if (groupConnections[groupId]?.isEmpty() == true) {
                groupConnections.remove(groupId)
            }
        }
        logger.info("User $userId unsubscribed (Connection ID: $connectionId)" + if (groupId != 0L) " from group $groupId" else "")
    }

    private fun cleanupInactiveConnections() {
        val now = Instant.now()
        lastActivityTime.forEach { (userId, connections) ->
            connections.entries.removeIf { (connectionId, lastActivity) ->
                if (now.isAfter(lastActivity.plus(CONNECTION_TIMEOUT))) {
                    removeConnection(userId, groupConnections.entries.find { it.value.contains(userId) }?.key ?: 0L, connectionId)
                    logger.info("Inactive connection removed for user $userId (Connection ID: $connectionId)")
                    true
                } else {
                    false
                }
            }
        }
    }

    private fun sendHeartbeat() {
        val heartbeatEvent = SseMessageDto(
            id = "heartbeat",
            type = SseEventType.HEARTBEAT,
            data = "Heartbeat"
        )
        userConnections.keys.forEach { userId ->
            sendEvent(userId, heartbeatEvent)
        }
        logger.debug("Heartbeat sent to all connected users")
    }

    private fun serializeMessage(data: Any): String {
        return when (data) {
            is String -> data
            is Number, is Boolean -> data.toString()
            else -> try {
                objectMapper.writeValueAsString(data)
            } catch (e: Exception) {
                logger.error("Failed to serialize data: $data", e)
                objectMapper.writeValueAsString(mapOf("error" to "Unable to serialize data"))
            }
        }
    }
}
