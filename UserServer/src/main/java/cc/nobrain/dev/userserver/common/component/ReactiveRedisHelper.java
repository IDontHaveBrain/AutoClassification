package cc.nobrain.dev.userserver.common.component;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReactiveRedisHelper {

    private final ReactiveRedisTemplate<String, Object> reactiveRedisTemplate;
    private final ReactiveStringRedisTemplate reactiveStringRedisTemplate;
    private final ObjectMapper objectMapper;

    private final Long DEFAULT_EXPIRE_TIME = 3600L;

    public Mono<Boolean> put(String key, Object value, Long expirationTime) {
        try {
            return reactiveRedisTemplate.opsForValue().set(key, value, Duration.ofSeconds(expirationTime));
        } catch (Exception e) {
            log.error("ReactiveRedis put error", e);
            return Mono.error(e);
        }
    }

    public Mono<Boolean> put(String key, Object value) {
        try {
            return this.put(key, value, DEFAULT_EXPIRE_TIME);
        } catch (Exception e) {
            log.error("ReactiveRedis put error", e);
            return Mono.error(e);
        }
    }

    public Mono<Boolean> put(String key, Object value, Boolean noExpiration) {
        try {
            if (noExpiration) {
                return reactiveRedisTemplate.opsForValue().set(key, value);
            } else {
                return this.put(key, value, DEFAULT_EXPIRE_TIME);
            }
        } catch (Exception e) {
            log.error("ReactiveRedis put error", e);
            return Mono.error(e);
        }
    }

    public <T> Mono<T> get(String key, Class<T> clazz) {
        return reactiveRedisTemplate.opsForValue()
                .get(key)
                .map(original -> {
                    try {
                        String jsonString = objectMapper.writeValueAsString(original);
                        return objectMapper.readValue(jsonString, clazz);
                    } catch (Exception e) {
                        log.error("ReactiveRedis get error", e);
                        return null;
                    }
                });
    }

    public Mono<String> getString(String key) {
        try {
            return reactiveStringRedisTemplate.opsForValue().get(key)
                    .map(original -> {
                        try {
                            return objectMapper.readValue(original, String.class);
                        } catch (Exception e) {
                            log.error("ReactiveRedis getString error", e);
                            return null;
                        }
                    });
        } catch (Exception e) {
            log.error("ReactiveRedis getString error", e);
            return Mono.error(e);
        }
    }

    public Mono<Long> delete(String key) {
        try {
            return reactiveStringRedisTemplate.delete(key);
        } catch (Exception e) {
            log.error("ReactiveRedis delete error", e);
            return Mono.error(e);
        }
    }

}
