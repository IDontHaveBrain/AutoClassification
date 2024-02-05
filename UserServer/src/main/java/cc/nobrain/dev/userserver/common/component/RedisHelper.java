package cc.nobrain.dev.userserver.common.component;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisHelper {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    private final ObjectMapper objectMapper;

    private final Long DEFAULT_EXPIRE_TIME = 3600L;

    public RedisTemplate<String, Object> getTemplate() {
        return redisTemplate;
    }

    public void put(String key, Object value, Long expirationTime) {
        try {
            redisTemplate.opsForValue().set(key, value, expirationTime, TimeUnit.SECONDS);
        } catch (DataAccessException e) {
            log.error("Redis put error", e);
        }
    }

    public void put(String key, Object value) {
        try {
            this.put(key, value, DEFAULT_EXPIRE_TIME);
        } catch (DataAccessException e) {
            log.error("Redis put error", e);
        }
    }

    public void put(String key, Object value, Boolean noExpiration) {
        try {
            if (noExpiration) {
                redisTemplate.opsForValue().set(key, value);
            } else {
                this.put(key, value, DEFAULT_EXPIRE_TIME);
            }
        } catch (DataAccessException e) {
            log.error("Redis put error", e);
        }
    }

    public <T> T get(String key, Class<T> type) {
        T result = null;
        try {
            result = objectMapper.convertValue(redisTemplate.opsForValue().get(key), type);
        } catch (DataAccessException e) {
            log.error("Redis get error", e);
        }

        return result;
    }

//    public void put(String key, String value, Long expirationTime) {
//        try {
//            stringRedisTemplate.opsForValue().set(key, value, expirationTime, TimeUnit.SECONDS);
//        } catch (DataAccessException e) {
//            log.error("Redis put error", e);
//        }
//    }
//
//    public void put(String key, String value) {
//        try {
//            this.put(key, value, DEFAULT_EXPIRE_TIME);
//        } catch (DataAccessException e) {
//            log.error("Redis put error", e);
//        }
//    }

    public void put(String key, String value, Boolean noExpiration) {
        try {
            if (noExpiration) {
                stringRedisTemplate.opsForValue().set(key, value);
            } else {
                this.put(key, value, DEFAULT_EXPIRE_TIME);
            }
        } catch (DataAccessException e) {
            log.error("Redis put error", e);
        }
    }

    public String getString(String key) {
        String rst = null;
        try {
            rst = objectMapper.convertValue(redisTemplate.opsForValue().get(key), String.class);
        } catch (DataAccessException e) {
            log.error("Redis get error", e);
        }

        return rst;
    }

    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (DataAccessException e) {
            log.error("Redis delete error", e);
        }
    }

    public Boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (DataAccessException e) {
            log.error("Redis hasKey error", e);
            return false;
        }
    }

    public Long increment(String key, Long value) {
        try {
            return redisTemplate.opsForValue().increment(key, value);
        } catch (DataAccessException e) {
            log.error("Redis increment error", e);
            return 0L;
        }
    }

    public Long decrement(String key, Long value) {
        try {
            return redisTemplate.opsForValue().decrement(key, value);
        } catch (DataAccessException e) {
            log.error("Redis decrement error", e);
            return 0L;
        }
    }

    public void expire(String key, Long expirationTime) {
        try {
            redisTemplate.expire(key, expirationTime, TimeUnit.SECONDS);
        } catch (DataAccessException e) {
            log.error("Redis expire error", e);
        }
    }

    public Boolean persist(String key) {
        try {
            return redisTemplate.persist(key);
        } catch (DataAccessException e) {
            log.error("Redis persist error", e);
            return false;
        }
    }
}
