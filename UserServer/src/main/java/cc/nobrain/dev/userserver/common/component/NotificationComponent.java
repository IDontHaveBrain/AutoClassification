package cc.nobrain.dev.userserver.common.component;

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

    public final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    public final Map<Long, Instant> lastResponse = new ConcurrentHashMap<>();
    public final Map<Long, Sinks.Many<ServerSentEvent<String>>> processors = new ConcurrentHashMap<>();
    public ScheduledFuture<?> heartbeatTask;
    public ScheduledFuture<?> removalTask;

    private final Long EXPIRATION_TIME = 60L;
    private final Long HEARTBEAT_INTERVAL = 10L;

    public NotificationComponent() {
        this.heartbeatTask = this.scheduler.scheduleAtFixedRate(this::sendHeartbeat, 0, HEARTBEAT_INTERVAL, TimeUnit.SECONDS);
        this.removalTask = this.scheduler.scheduleAtFixedRate(this::removeInactiveUsers, 0, 10, TimeUnit.SECONDS);
    }

    public void sendHeartbeat() {
        Mono.just("Heartbeat")
                .publishOn(Schedulers.boundedElastic())
                .doOnNext(this::sendMessageToAll)
                .subscribe();
    }

    public void updateLastResponse(Long memberId, Instant time) {
        if(processors.containsKey(memberId)) {
            lastResponse.put(memberId, time);
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

    public synchronized void addSubscriber(Long memberId) {
        processors.put(memberId, Sinks.many().replay().latest());
        lastResponse.put(memberId, Instant.now());
    }

    public Flux<ServerSentEvent<String>> subscribe(Long memberId) {
        processors.putIfAbsent(memberId, Sinks.many().replay().latest());
        lastResponse.putIfAbsent(memberId, Instant.now());
        return processors.get(memberId).asFlux();
    }

    public synchronized void removeSubscriber(Long memberId) {
        processors.remove(memberId);
        lastResponse.remove(memberId);
    }

    public void sendMessage(Long memberId, String message) {
        Sinks.Many<ServerSentEvent<String>> processor = processors.get(memberId);
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
