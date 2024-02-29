package cc.nobrain.dev.userserver.common.component

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.data.redis.core.ReactiveRedisTemplate
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.Duration

@Component
class ReactiveRedisHelper(
        private val reactiveRedisTemplate: ReactiveRedisTemplate<String, Any>,
        private val reactiveStringRedisTemplate: ReactiveStringRedisTemplate,
        private val objectMapper: ObjectMapper
) {

    companion object {
        private const val DEFAULT_EXPIRE_TIME = 3600L
    }

    fun getTemplate(): ReactiveRedisTemplate<String, Any> {
        return reactiveRedisTemplate
    }

    fun put(key: String, value: Any, expirationTime: Long): Mono<Boolean> {
        return try {
            reactiveRedisTemplate.opsForValue().set(key, value, Duration.ofSeconds(expirationTime))
        } catch (e: Exception) {
            Mono.error(e)
        }
    }

    fun put(key: String, value: Any): Mono<Boolean> {
        return try {
            this.put(key, value, DEFAULT_EXPIRE_TIME)
        } catch (e: Exception) {
            Mono.error(e)
        }
    }

    fun put(key: String, value: Any, noExpiration: Boolean): Mono<Boolean> {
        return try {
            if (noExpiration) {
                reactiveRedisTemplate.opsForValue().set(key, value)
            } else {
                this.put(key, value, DEFAULT_EXPIRE_TIME)
            }
        } catch (e: Exception) {
            Mono.error(e)
        }
    }

    fun <T> get(key: String, clazz: Class<T>): Mono<T> {
        return reactiveRedisTemplate.opsForValue()
                .get(key)
                .map { original ->
                    try {
                        val jsonString = objectMapper.writeValueAsString(original)
                        objectMapper.readValue(jsonString, clazz)
                    } catch (e: Exception) {
                        null
                    }
                }
    }

    fun getString(key: String): Mono<String> {
        return try {
            reactiveStringRedisTemplate.opsForValue().get(key)
                    .map { original ->
                        try {
                            objectMapper.readValue(original, String::class.java)
                        } catch (e: Exception) {
                            null
                        }
                    }
        } catch (e: Exception) {
            Mono.error(e)
        }
    }

    fun delete(key: String): Mono<Long> {
        return try {
            reactiveStringRedisTemplate.delete(key)
        } catch (e: Exception) {
            Mono.error(e)
        }
    }
}