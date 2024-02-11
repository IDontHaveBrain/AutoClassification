package cc.nobrain.dev.userserver.sse;

import cc.nobrain.dev.userserver.common.WithMockMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.FluxExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static cc.nobrain.dev.userserver.common.TestUtil.accessToken;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient(timeout = "36000")
@WithMockMember
public class SseTest {

    @LocalServerPort
    private int port;

    @Autowired
    private WebTestClient webClient;

    @BeforeEach
    void setUp() {
        webClient = webClient.mutate()
                .defaultHeader("Authorization", "Bearer " + accessToken)
                .build();
    }

    @Test
    public void testHeartbeat() {
        FluxExchangeResult<String> eventStream = webClient.get()
                .uri("/sse/subscribe")
                .accept(MediaType.TEXT_EVENT_STREAM)
//                .header("Authorization", "Bearer " + accessToken)
                .exchange()
                .expectStatus().isOk()
                .returnResult(String.class);

        Flux eventFlux = eventStream.getResponseBody();

        StepVerifier.create(eventFlux)
                .expectNext("Heartbeat")
                .then(() -> {
                    webClient.get()
                            .uri("/sse/ok")
                            .exchange()
                            .expectStatus().isOk();
                    System.out.println("Heartbeat Response!!!!");
                })
                .expectNext("Heartbeat")
                .thenCancel()
                .verify();

        System.out.println("testHeartbeat() completed");
    }
}
