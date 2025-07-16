package cc.nobrain.dev.userserver.domain.sse.service

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import cc.nobrain.dev.userserver.domain.sse.handler.SseHandler
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import java.time.Instant
import org.slf4j.LoggerFactory
import java.util.*

@Service
class SseService(
    private val sseHandler: SseHandler,
    private val memberRepository: MemberRepository,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(SseService::class.java)

    fun subscribeUser(userId: String): Flux<ServerSentEvent<String>> {
        logger.info("User $userId subscribing")
        val member = memberRepository.findById(userId.toLong()).orElseThrow { IllegalArgumentException("User not found") }
        val groupId = member.memberGroup?.id ?: 0L
        return sseHandler.subscribe(userId, groupId)
            .doOnSubscribe { logger.info("User $userId subscribed successfully") }
            .doOnCancel { logger.info("User $userId unsubscribed") }
            .doOnError { error -> logger.error("Error in SSE stream for user $userId: ${error.message}") }
    }

    fun sendMessage(userId: String, sseMessage: SseMessageDto) {
        if (sseMessage.validate()) {
            sseHandler.sendEvent(userId, sseMessage)
            logger.debug("Sent message to user: $userId, type: ${sseMessage.type}")
        } else {
            logger.warn("Invalid message for user: $userId, type: ${sseMessage.type}")
        }
    }

    fun sendMessage(userId: String, message: String) {
        val sseMessage = SseMessageDto(
            id = UUID.randomUUID().toString(),
            type = SseEventType.MESSAGE,
            data = message
        )
        sendMessage(userId, sseMessage)
    }

    fun sendGroupMessage(groupId: Long, message: String) {
        val sseMessage = SseMessageDto(
            id = UUID.randomUUID().toString(),
            type = SseEventType.MESSAGE,
            data = message
        )
        if (sseMessage.validate()) {
            sseHandler.sendGroupEvent(groupId, sseMessage)
            logger.debug("Sent group message to group: $groupId, type: ${sseMessage.type}")
        } else {
            logger.warn("Invalid group message for group: $groupId, type: ${sseMessage.type}")
        }
    }

    fun broadcastMessage(message: String) {
        val sseMessage = SseMessageDto(
            id = UUID.randomUUID().toString(),
            type = SseEventType.MESSAGE,
            data = message
        )
        if (sseMessage.validate()) {
            sseHandler.broadcastEvent(sseMessage)
            logger.debug("Broadcasted message to all users")
        } else {
            logger.warn("Invalid broadcast message")
        }
    }

    fun handleHeartbeatResponse(userId: String, payload: Map<String, Any>) {
        logger.debug("Processing heartbeat response from user: $userId")
        
        try {
            val timestamp = payload["timestamp"] as? Number
            if (timestamp != null) {
                val responseTime = System.currentTimeMillis() - timestamp.toLong()
                logger.debug("Heartbeat round-trip time for user $userId: ${responseTime}ms")
                
                sseHandler.updateUserActivity(userId)
            } else {
                logger.warn("Heartbeat response from user $userId missing timestamp")
            }
        } catch (e: Exception) {
            logger.error("Error processing heartbeat response from user $userId", e)
        }
    }
}
