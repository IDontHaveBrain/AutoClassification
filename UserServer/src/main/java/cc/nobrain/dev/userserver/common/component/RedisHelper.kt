package cc.nobrain.dev.userserver.common.component

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.dao.DataAccessException
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.concurrent.TimeUnit
import org.slf4j.LoggerFactory

@Component
class RedisHelper(
        private val redisTemplate: RedisTemplate<String, Any>,
        private val stringRedisTemplate: StringRedisTemplate,
        private val objectMapper: ObjectMapper
) {

    companion object {
        private val log = LoggerFactory.getLogger(RedisHelper::class.java)
        private const val DEFAULT_EXPIRE_TIME = 3600L
    }

    fun getTemplate(): RedisTemplate<String, Any> {
        return redisTemplate
    }

    fun put(key: String, value: Any, expirationTime: Long) {
        try {
            redisTemplate.opsForValue().set(key, value, expirationTime, TimeUnit.SECONDS)
        } catch (e: DataAccessException) {
            log.error("Redis put error", e)
        }
    }

    fun put(key: String, value: Any) {
        try {
            this.put(key, value, DEFAULT_EXPIRE_TIME)
        } catch (e: DataAccessException) {
            log.error("Redis put error", e)
        }
    }

    fun put(key: String, value: Any, noExpiration: Boolean) {
        try {
            if (noExpiration) {
                redisTemplate.opsForValue().set(key, value)
            } else {
                this.put(key, value, DEFAULT_EXPIRE_TIME)
            }
        } catch (e: DataAccessException) {
            log.error("Redis put error", e)
        }
    }

    fun <T> get(key: String, type: Class<T>): T? {
        var result: T? = null
        try {
            result = objectMapper.convertValue(redisTemplate.opsForValue().get(key), type)
        } catch (e: DataAccessException) {
            log.error("Redis get error", e)
        }

        return result
    }

    fun put(key: String, value: String, noExpiration: Boolean) {
        try {
            if (noExpiration) {
                stringRedisTemplate.opsForValue().set(key, value)
            } else {
                this.put(key, value, DEFAULT_EXPIRE_TIME)
            }
        } catch (e: DataAccessException) {
            log.error("Redis put error", e)
        }
    }

    fun getString(key: String): String? {
        var rst: String? = null
        try {
            rst = objectMapper.convertValue(redisTemplate.opsForValue().get(key), String::class.java)
        } catch (e: DataAccessException) {
            log.error("Redis get error", e)
        }

        return rst
    }

    fun delete(key: String) {
        try {
            redisTemplate.delete(key)
        } catch (e: DataAccessException) {
            log.error("Redis delete error", e)
        }
    }

    fun hasKey(key: String): Boolean {
        return try {
            redisTemplate.hasKey(key)
        } catch (e: DataAccessException) {
            log.error("Redis hasKey error", e)
            false
        }
    }

    fun increment(key: String, value: Long): Long {
        return try {
            redisTemplate.opsForValue().increment(key, value) ?: 0L
        } catch (e: DataAccessException) {
            log.error("Redis increment error", e)
            0L
        }
    }

    fun decrement(key: String, value: Long): Long {
        return try {
            redisTemplate.opsForValue().decrement(key, value) ?: 0L
        } catch (e: DataAccessException) {
            log.error("Redis decrement error", e)
            0L
        }
    }

    fun expire(key: String, expirationTime: Long) {
        try {
            redisTemplate.expire(key, expirationTime, TimeUnit.SECONDS)
        } catch (e: DataAccessException) {
            log.error("Redis expire error", e)
        }
    }

    fun persist(key: String): Boolean {
        return try {
            redisTemplate.persist(key)
        } catch (e: DataAccessException) {
            log.error("Redis persist error", e)
            false
        }
    }
}