package cc.nobrain.dev.userserver.domain.sse.service

import cc.nobrain.dev.userserver.common.component.NotificationComponent
import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant
import org.slf4j.LoggerFactory
import reactor.core.scheduler.Schedulers

@Service
class SseService(private val notificationComponent: NotificationComponent) {
    private val logger = LoggerFactory.getLogger(SseService::class.java)
    private val scheduler = Schedulers.newBoundedElastic(10, 100, "sse-service")

    fun updateLastResponse(userId: String, time: Instant) {
        Mono.fromRunnable<Unit> { notificationComponent.updateLastResponse(userId, time) }
            .subscribeOn(scheduler)
            .subscribe()
        logger.debug("Updated last response for user: $userId")
    }

    fun subscribeUser(userId: String): Flux<ServerSentEvent<String>> {
        return notificationComponent.subscribe(userId)
            .doOnNext { updateLastResponse(userId, Instant.now()) }
            .doOnSubscribe { 
                sendInitialHeartbeat(userId)
                logger.info("User $userId subscribed")
            }
    }

    private fun sendInitialHeartbeat(userId: String) {
        val heartbeatMessage = SseMessageDto(
            id = "initial_heartbeat",
            type = SseEventType.HEARTBEAT,
            message = "Initial Heartbeat"
        )
        sendMessage(userId, heartbeatMessage)
    }

    fun sendMessage(userId: String, message: String) {
        val sseMessage = SseMessageDto(
            id = null,
            type = SseEventType.MESSAGE,
            message = message
        )
        sendMessage(userId, sseMessage)
    }

    fun sendMessage(userId: String, sseMessage: SseMessageDto) {
        Mono.fromRunnable<Unit> {
            if (sseMessage.validate()) {
                notificationComponent.sendMessage(userId, sseMessage)
                logger.debug("Sent message to user: $userId, type: ${sseMessage.type}")
            } else {
                logger.warn("Invalid message for user: $userId, type: ${sseMessage.type}")
            }
        }.subscribeOn(scheduler).subscribe()
    }

    fun broadcastMessage(message: String) {
        val sseMessage = SseMessageDto(
            id = null,
            type = SseEventType.MESSAGE,
            message = message
        )
        Mono.fromRunnable<Unit> {
            if (sseMessage.validate()) {
                notificationComponent.sendMessageToAll(sseMessage.toString())
                logger.debug("Broadcasted message to all users")
            } else {
                logger.warn("Invalid broadcast message")
            }
        }.subscribeOn(scheduler).subscribe()
    }
}
