package cc.nobrain.dev.userserver.domain.sse.controller;

import cc.nobrain.dev.userserver.common.component.NotificationComponent;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.Instant;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sse")
public class SseController {

    private final NotificationComponent notificationComponent;

    @GetMapping("/ok")
    public void heartBeat(@AuthenticationPrincipal Member member) {
        notificationComponent.updateLastResponse(member.getId(), Instant.now());
    }

    @GetMapping("/subscribe")
    public Flux<ServerSentEvent<String>> subscribe(@AuthenticationPrincipal Member member) {
        notificationComponent.addSubscriber(member.getId());
        return notificationComponent.subscribe(member.getId())
                .doOnCancel(() -> notificationComponent.removeSubscriber(member.getId()))
                .doOnComplete(() -> notificationComponent.removeSubscriber(member.getId()))
                .doOnNext(event -> notificationComponent.updateLastResponse(member.getId(), Instant.now()))
                .timeout(Duration.ofSeconds(30), Flux.just(ServerSentEvent.builder("timeout").build()))
                .doOnTerminate(() -> notificationComponent.removeSubscriber(member.getId()));
    }
}
