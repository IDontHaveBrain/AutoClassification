package cc.nobrain.dev.userserver.common.component;

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType;
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto;
import jakarta.annotation.PreDestroy;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxProcessor;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.*;

@Component
public class NotificationComponent {

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Map<String, Instant> lastResponse = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<ServerSentEvent<String>>> processors = new ConcurrentHashMap<>();
    private ScheduledFuture<?> heartbeatTask;
    private ScheduledFuture<?> removalTask;

    private final Long EXPIRATION_TIME = 60L;
    private final Long HEARTBEAT_INTERVAL = 30L;

    public NotificationComponent() {
        this.heartbeatTask = this.scheduler.scheduleAtFixedRate(this::sendHeartbeat, 0, HEARTBEAT_INTERVAL, TimeUnit.SECONDS);
        this.removalTask = this.scheduler.scheduleAtFixedRate(this::removeInactiveUsers, 0, 10, TimeUnit.SECONDS);
    }

    public void sendHeartbeat() {
        SseMessageDto msg = SseMessageDto.builder()
                .id("ping")
                .type(SseEventType.HEARTBEAT)
                .message("Heartbeat")
                .build();
        Mono.just(msg.toString())
                .publishOn(Schedulers.boundedElastic())
                .doOnNext(this::sendMessageToAll)
                .subscribe();
    }

    public void updateLastResponse(String id, Instant time) {
        if(processors.containsKey(id)) {
            lastResponse.put(id, time);
        } else {
            throw new IllegalArgumentException("Expired Connection");
        }
    }

    public synchronized void removeInactiveUsers() {
        Instant now = Instant.now();
        lastResponse.entrySet().stream()
                .filter(entry -> Duration.between(entry.getValue(), now).getSeconds() > EXPIRATION_TIME)
                .forEach(entry -> {
                    removeSubscriber(entry.getKey());
                });
    }

    public synchronized void addSubscriber(String id) {
        processors.put(id, Sinks.many().replay().latest());
        lastResponse.put(id, Instant.now());
    }

    public Flux<ServerSentEvent<String>> subscribe(String id) {
        processors.putIfAbsent(id, Sinks.many().replay().latest());
        lastResponse.putIfAbsent(id, Instant.now());
        return processors.get(id).asFlux();
    }

    public synchronized void removeSubscriber(String id) {
        processors.remove(id);
        lastResponse.remove(id);
    }

    public void sendMessage(String id, String message) {
        Sinks.Many<ServerSentEvent<String>> processor = processors.get(id);
        if (processor != null)
            processor.emitNext(ServerSentEvent.builder(message).build(), Sinks.EmitFailureHandler.FAIL_FAST);
    }

    public void sendMessageToAll(String message) {
        Flux.fromIterable(processors.entrySet())
                .publishOn(Schedulers.boundedElastic())
                .doOnNext(entry -> {

                    entry.getValue().emitNext(
                            ServerSentEvent.builder(message).build(),
                            Sinks.EmitFailureHandler.FAIL_FAST);
                })
                .subscribe();
    }

    @PreDestroy
    public void shutdown() {
        this.heartbeatTask.cancel(true);
        this.removalTask.cancel(true);
        this.scheduler.shutdown();
    }
}
