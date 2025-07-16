package cc.nobrain.dev.userserver.domain.sse.controller

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.sse.service.SseService
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/sse")
class SseController(private val sseService: SseService) {
    private val logger = LoggerFactory.getLogger(SseController::class.java)

    @GetMapping("/subscribe")
    fun subscribe(@AuthenticationPrincipal member: Member): Flux<ServerSentEvent<String>> {
        logger.info("New SSE subscription for user: ${member.id}")
        return sseService.subscribeUser(member.id.toString())
            .doOnSubscribe { logger.debug("User ${member.id} subscribed to SSE") }
            .doOnCancel { logger.debug("User ${member.id} unsubscribed from SSE") }
            .doOnError { error -> logger.error("Error in SSE stream for user ${member.id}", error) }
    }

    @PostMapping("/send")
    fun sendMessage(@AuthenticationPrincipal member: Member, @RequestBody message: String) {
        logger.debug("Sending message for user: ${member.id}")
        sseService.sendMessage(member.id.toString(), message)
    }

    @PostMapping("/broadcast")
    fun broadcastMessage(@RequestBody message: String) {
        logger.debug("Broadcasting message to all users")
        sseService.broadcastMessage(message)
    }

    @PostMapping("/send-group")
    fun sendGroupMessage(@AuthenticationPrincipal member: Member, @RequestBody message: String) {
        logger.debug("Sending group message for user: ${member.id}")
        member.memberGroup?.id?.let { groupId ->
            sseService.sendGroupMessage(groupId, message)
        } ?: run {
            logger.warn("User ${member.id} attempted to send a group message but has no group")
        }
    }

    @PostMapping("/heartbeat-response")
    fun heartbeatResponse(@AuthenticationPrincipal member: Member, @RequestBody payload: Map<String, Any>): ResponseEntity<Map<String, String>> {
        logger.debug("Heartbeat response received from user: ${member.id}")
        sseService.handleHeartbeatResponse(member.id.toString(), payload)
        return ResponseEntity.ok(mapOf("status" to "acknowledged"))
    }
}
