package cc.nobrain.dev.userserver.domain.sse.controller

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.sse.service.SseService
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import java.time.Instant
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/sse")
class SseController(private val sseService: SseService) {
    private val logger = LoggerFactory.getLogger(SseController::class.java)

    @PostMapping("/heartbeat")
    suspend fun heartbeat(@AuthenticationPrincipal member: Member) {
        logger.debug("Received heartbeat from user: ${member.id}")
        sseService.updateLastResponse(member.id.toString(), Instant.now())
    }

    @PostMapping("/ok")
    suspend fun ok(@AuthenticationPrincipal member: Member) {
        logger.debug("Received OK from user: ${member.id}")
        sseService.updateLastResponse(member.id.toString(), Instant.now())
    }

    @GetMapping("/subscribe")
    suspend fun subscribe(@AuthenticationPrincipal member: Member): Flux<ServerSentEvent<String>> {
        logger.info("New SSE subscription for user: ${member.id}")
        return sseService.subscribeUser(member.id.toString())
            .doOnSubscribe { logger.debug("User ${member.id} subscribed to SSE") }
            .doOnCancel { logger.debug("User ${member.id} unsubscribed from SSE") }
            .doOnError { error -> logger.error("Error in SSE stream for user ${member.id}", error) }
    }

    @PostMapping("/send")
    suspend fun sendMessage(@AuthenticationPrincipal member: Member, @RequestBody message: String) {
        logger.debug("Sending message for user: ${member.id}")
        sseService.sendMessage(member.id.toString(), message)
    }
}
