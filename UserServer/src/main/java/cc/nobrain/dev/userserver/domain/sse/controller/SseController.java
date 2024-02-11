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
        Member membertest = Member.builder().id(1L).email("test@test.com").password("123123").build();
        notificationComponent.updateLastResponse(membertest.getId(), Instant.now());
    }

    @GetMapping("/subscribe")
    public Flux<ServerSentEvent<String>> subscribe(@AuthenticationPrincipal Member member) {
        Member membertest = Member.builder().id(1L).email("test@test.com").password("123123").build();
        notificationComponent.addSubscriber(membertest.getId());
        return notificationComponent.subscribe(membertest.getId())
                .doOnCancel(() -> notificationComponent.removeSubscriber(membertest.getId()))
                .doOnComplete(() -> notificationComponent.removeSubscriber(membertest.getId()))
                .doOnNext(event -> notificationComponent.updateLastResponse(membertest.getId(), Instant.now()))
                .doOnTerminate(() -> notificationComponent.removeSubscriber(membertest.getId()));
    }
}
