package cc.nobrain.dev.userserver.sse;

import cc.nobrain.dev.userserver.domain.sse.controller.SseController;
import jdk.jfr.Event;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.test.web.reactive.server.FluxExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient(timeout = "36000")
public class SseTest {

    @LocalServerPort
    private int port;

    @Autowired
    private WebTestClient webClient;

    @BeforeEach
    void setUp() {
    }

    @Test
    public void testHeartbeat() {

        FluxExchangeResult<String> eventStream = webClient.get()
                .uri("/sse/subscribe")
                .accept(MediaType.TEXT_EVENT_STREAM)
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
