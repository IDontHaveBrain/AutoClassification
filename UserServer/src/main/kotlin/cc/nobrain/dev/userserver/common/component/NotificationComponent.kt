package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto
import jakarta.annotation.PreDestroy
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.Sinks
import reactor.core.scheduler.Schedulers
import java.time.Duration
import java.time.Instant
import java.util.concurrent.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import reactor.core.Disposable

@Component
class NotificationComponent {
    private val logger = LoggerFactory.getLogger(NotificationComponent::class.java)

    private val scheduler = Schedulers.newBoundedElastic(10, 100, "sse-scheduler")
    private val lastResponse = ConcurrentHashMap<String, Instant>()
    private val processors = ConcurrentHashMap<String, Sinks.Many<ServerSentEvent<String>>>()
    private var heartbeatTask: Disposable? = null
    private var removalTask: Disposable? = null

    private val EXPIRATION_TIME = Duration.ofMinutes(3)
    private val HEARTBEAT_INTERVAL = Duration.ofSeconds(30)
    private val REMOVAL_INTERVAL = Duration.ofMinutes(1)

    init {
        heartbeatTask = Flux.interval(HEARTBEAT_INTERVAL)
            .flatMap { Mono.fromRunnable<Unit> { sendHeartbeat() }.subscribeOn(scheduler) }
            .subscribe()

        removalTask = Flux.interval(REMOVAL_INTERVAL)
            .flatMap { Mono.fromRunnable<Unit> { removeInactiveUsers() }.subscribeOn(scheduler) }
            .subscribe()
    }

    fun sendHeartbeat() {
        val msg = SseMessageDto(
            id = "ping",
            type = SseEventType.HEARTBEAT,
            message = "Heartbeat"
        )
        sendMessageToAll(msg.toString())
        logger.debug("Heartbeat sent to all active connections")
    }

    fun updateLastResponse(id: String, time: Instant) {
        lastResponse[id] = time
        logger.debug("Updated last response for user: $id")
    }

    fun removeInactiveUsers() {
        val now = Instant.now()
        lastResponse.entries.removeIf { (id, lastResponseTime) ->
            if (Duration.between(lastResponseTime, now) >= EXPIRATION_TIME) {
                processors.remove(id)?.tryEmitComplete()
                logger.info("Removed inactive user: $id")
                true
            } else {
                false
            }
        }
    }

    fun addSubscriber(id: String) {
        processors.computeIfAbsent(id) { Sinks.many().multicast().onBackpressureBuffer() }
        lastResponse[id] = Instant.now()
        logger.info("Added new subscriber: $id")
    }

    fun subscribe(id: String): Flux<ServerSentEvent<String>> {
        addSubscriber(id)
        return processors[id]!!.asFlux()
            .doOnCancel {
                removeSubscriber(id)
                logger.info("User $id unsubscribed")
            }
    }

    fun removeSubscriber(id: String) {
        processors.remove(id)?.tryEmitComplete()
        lastResponse.remove(id)
        logger.info("Removed subscriber: $id")
    }

    fun sendMessage(id: String, message: String) {
        val processor = processors[id]
        processor?.tryEmitNext(ServerSentEvent.builder(message).build())
        logger.debug("Sent message to user: $id")
    }

    @Autowired
    private lateinit var sseMessageDtoSerializer: SseMessageDto.SseMessageDtoSerializer

    fun sendMessage(id: String, message: SseMessageDto) {
        sendMessage(id, sseMessageDtoSerializer.serialize(message))
    }

    fun sendMessageToAll(message: String) {
        val messageEvent = ServerSentEvent.builder(message).build()
        processors.values.forEach { sink ->
            sink.tryEmitNext(messageEvent)
        }
        logger.debug("Sent message to all active connections")
    }

    @PreDestroy
    fun shutdown() {
        heartbeatTask?.dispose()
        removalTask?.dispose()
        processors.values.forEach { it.tryEmitComplete() }
        scheduler.dispose()
        logger.info("NotificationComponent shut down")
    }
}
