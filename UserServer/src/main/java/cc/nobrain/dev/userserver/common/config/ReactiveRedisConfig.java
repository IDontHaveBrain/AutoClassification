package cc.nobrain.dev.userserver.common.config;

import lombok.RequiredArgsConstructor;
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
        value="app.redis.reactiveInit",
        havingValue = "true",
        matchIfMissing = true)
@RequiredArgsConstructor
public class ReactiveRedisConfig {

    private final RedisProperties redisProperties;

    @Bean
    public ReactiveRedisConnectionFactory reactiveRedisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
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
//        RedisProperties.Lettuce lettuceConfig = redisProperties.getLettuce();
//        LettuceClientConfiguration.LettuceClientConfigurationBuilder lettuceConfigBuilder = LettuceClientConfiguration.builder();
//        return new LettuceConnectionFactory(redisStandaloneConfiguration, lettuceConfigBuilder.build());

        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    /**
     * 커스텀 ReactiveRedisTemplate 설정
     * 커스터마이징 필요시 하단 코드 사용.
     */
    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(ReactiveRedisConnectionFactory reactiveRedisConnectionFactory, ResourceLoader resourceLoader) {
        Jackson2JsonRedisSerializer<Object> jsonSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        RedisSerializationContext.RedisSerializationContextBuilder<String, Object> builder =
                RedisSerializationContext.newSerializationContext(new StringRedisSerializer());
        RedisSerializationContext<String, Object> context = builder.value(jsonSerializer).build();
        return new ReactiveRedisTemplate<>(reactiveRedisConnectionFactory, context);
    }

    /**
     * 커스텀 ReactiveStringRedisTemplate 설정
     * 커스터마이징 필요시 하단 코드 사용.
     */
    @Bean
    public ReactiveStringRedisTemplate reactiveStringRedisTemplate(ReactiveRedisConnectionFactory reactiveRedisConnectionFactory) {
        return new ReactiveStringRedisTemplate(reactiveRedisConnectionFactory);
    }
}
