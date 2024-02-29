package cc.nobrain.dev.userserver.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
@ConditionalOnProperty(
        value = ["app.redis.cacheInit"],
        havingValue = "true",
        matchIfMissing = false)
@RequiredArgsConstructor
@Lazy
class RedisCacheConfig {

    @Bean
    @Primary
    fun redisCacheManager(@Qualifier("redisConnectionFactory") redisConnectionFactory: RedisConnectionFactory): RedisCacheManager {
        val redisCacheConfiguration = RedisCacheConfiguration.defaultCacheConfig();

        val cacheConfigurations = Map.of(
                "member", RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)),
                "default", RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(5))
        );

        val redisCacheManager = RedisCacheManager.builder(redisConnectionFactory)
//                .cacheDefaults(redisCacheConfiguration)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();

        return redisCacheManager;
    }

}
