package cc.nobrain.dev.userserver.common.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.Objects;

@Configuration
@ConditionalOnProperty(
        value=["app.redis.reactiveInit"],
        havingValue = "true",
        matchIfMissing = true)
class ReactiveRedisConfig(
        private val redisProperties: RedisProperties,
) {
    @Bean(name = ["reactiveRedisConnectionFactory"])
    fun reactiveRedisConnectionFactory(): ReactiveRedisConnectionFactory {
        val redisStandaloneConfiguration = RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(redisProperties.getHost());
        redisStandaloneConfiguration.setPort(redisProperties.getPort());
        redisStandaloneConfiguration.setDatabase(redisProperties.getDatabase());
        if (Objects.nonNull(redisProperties.getUsername())) {
            redisStandaloneConfiguration.setUsername(redisProperties.getPassword());
        }
        if(Objects.nonNull(redisProperties.getPassword())) {
            redisStandaloneConfiguration.setPassword(redisProperties.getPassword());
        }

        /**
         * Lettuce 설정 커스터마이징 필요시 하단 코드 사용.
         */
        return LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    /**
     * 커스텀 ReactiveRedisTemplate 설정
     * 커스터마이징 필요시 하단 코드 사용.
     */
    @Bean
    fun reactiveRedisTemplate(
            @Qualifier("reactiveRedisConnectionFactory") reactiveRedisConnectionFactory: ReactiveRedisConnectionFactory,
            resourceLoader: ResourceLoader): ReactiveRedisTemplate<String, Any> {
        val jsonSerializer = Jackson2JsonRedisSerializer(Any::class.java)
        val builder = RedisSerializationContext.newSerializationContext<String, Any>(StringRedisSerializer())
        val context = builder.value(jsonSerializer).build()
        return ReactiveRedisTemplate(reactiveRedisConnectionFactory, context)
    }

    /**
     * 커스텀 ReactiveStringRedisTemplate 설정
     * 커스터마이징 필요시 하단 코드 사용.
     */
    @Bean
    fun reactiveStringRedisTemplate(
            @Qualifier("reactiveRedisConnectionFactory") reactiveRedisConnectionFactory: ReactiveRedisConnectionFactory): ReactiveStringRedisTemplate {
        return ReactiveStringRedisTemplate(reactiveRedisConnectionFactory);
    }
}
