package cc.nobrain.dev.userserver.common.config;

import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Primary
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import java.time.Duration

@Configuration
@EnableCaching
@ConditionalOnProperty(
        value = ["app.redis.cacheInit"],
        havingValue = "true",
        matchIfMissing = false)
@Lazy
class RedisCacheConfig {

    @Bean
    @Primary
    fun redisCacheManager(@Qualifier("redisConnectionFactory") redisConnectionFactory: RedisConnectionFactory): RedisCacheManager {
        val redisCacheConfiguration = RedisCacheConfiguration.defaultCacheConfig();

        val cacheConfigurations = mapOf(
            "member" to RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30L)),
            "default" to RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(5L))
        )

        val redisCacheManager = RedisCacheManager.builder(redisConnectionFactory)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build()

        return redisCacheManager
    }

}
