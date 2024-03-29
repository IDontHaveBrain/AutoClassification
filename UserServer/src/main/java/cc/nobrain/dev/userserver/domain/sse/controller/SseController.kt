package cc.nobrain.dev.userserver.domain.sse.controller

import cc.nobrain.dev.userserver.common.component.NotificationComponent
import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import java.time.Instant

@RestController
@RequestMapping("/api/sse")
class SseController(private val notificationComponent: NotificationComponent) {

    @PostMapping("/ok")
    suspend fun heartBeat(@AuthenticationPrincipal member: Member) {
        notificationComponent.updateLastResponse(member.username, Instant.now())
    }

    @GetMapping("/subscribe")
    suspend fun subscribe(@AuthenticationPrincipal member: Member): Flux<ServerSentEvent<String>> {
//        val sseStream = notificationComponent.addSubscriber(member.id.toString())
        val sseStream = notificationComponent.subscribe(member.id.toString())
            .doOnNext { notificationComponent.updateLastResponse(member.id.toString(), Instant.now())}
            .doOnTerminate { notificationComponent.removeSubscriber(member.id.toString()) }
        notificationComponent.sendHeartbeat();
        return sseStream;
    }
}