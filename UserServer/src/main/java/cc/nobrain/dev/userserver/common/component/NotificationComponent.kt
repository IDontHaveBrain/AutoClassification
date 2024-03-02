package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto
import jakarta.annotation.PreDestroy
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.Sinks
import reactor.core.scheduler.Schedulers
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

@Component
class NotificationComponent {

    private val scheduler = Executors.newScheduledThreadPool(1)
    private val lastResponse = ConcurrentHashMap<String, Instant>()
    private val processors = ConcurrentHashMap<String, Sinks.Many<ServerSentEvent<String>>>()
    private var heartbeatTask: ScheduledFuture<*>? = null
    private var removalTask: ScheduledFuture<*>? = null

    private val EXPIRATION_TIME = 120L
    private val HEARTBEAT_INTERVAL = 60L

    init {
        heartbeatTask = scheduler.scheduleAtFixedRate(::sendHeartbeat, 0, HEARTBEAT_INTERVAL, TimeUnit.SECONDS)
        removalTask = scheduler.scheduleAtFixedRate(::removeInactiveUsers, 0, 10, TimeUnit.SECONDS)
    }

    fun sendHeartbeat() {
        val msg = SseMessageDto(
                id = "ping",
                type = SseEventType.HEARTBEAT,
                message = "Heartbeat"
        )
        Mono.just(msg.toString())
                .publishOn(Schedulers.boundedElastic())
                .doOnNext(::sendMessageToAll)
            .subscribe()
    }

    fun updateLastResponse(id: String, time: Instant) {
        if (processors.containsKey(id)) {
            lastResponse[id] = time
        } else {
            throw IllegalArgumentException("Expired Connection")
        }
    }

    @Synchronized
    fun removeInactiveUsers() {
        val now = Instant.now()
        lastResponse.entries.removeIf { entry ->
                Duration.between(entry.value, now).seconds > EXPIRATION_TIME
        }
    }

    @Synchronized
    fun addSubscriber(id: String) {
        processors[id] = Sinks.many().replay().latest()
        lastResponse[id] = Instant.now()
    }

    fun subscribe(id: String): Flux<ServerSentEvent<String>> {
        processors.putIfAbsent(id, Sinks.many().replay().latest())
        lastResponse.putIfAbsent(id, Instant.now())
        return processors[id]!!.asFlux()
    }

    @Synchronized
    fun removeSubscriber(id: String) {
        processors.remove(id)
        lastResponse.remove(id)
    }

    fun sendMessage(id: String, message: String) {
        val processor = processors[id]
        processor?.emitNext(ServerSentEvent.builder(message)
            .build(), Sinks.EmitFailureHandler.FAIL_FAST)
    }

    fun sendMessageToAll(message: String) {
        Flux.fromIterable(processors.entries)
                .publishOn(Schedulers.boundedElastic())
                .doOnNext { entry ->
                entry.value.emitNext(
                        ServerSentEvent.builder(message).build(),
                        Sinks.EmitFailureHandler.FAIL_FAST
                )
        }
            .subscribe()
    }

    @PreDestroy
    fun shutdown() {
        heartbeatTask?.cancel(true)
        removalTask?.cancel(true)
        scheduler.shutdown()
    }
}