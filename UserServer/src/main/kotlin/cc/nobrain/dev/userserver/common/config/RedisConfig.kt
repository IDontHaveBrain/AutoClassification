package cc.nobrain.dev.userserver.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.Objects;

@Configuration
@ConditionalOnProperty(
        value= ["app.redis.defaultInit"],
        havingValue = "true",
        matchIfMissing = true)
class RedisConfig(
        private val redisProperties: RedisProperties,
        private val objectMapper: ObjectMapper
) {

    @Bean(name = ["redisConnectionFactory"])
    fun redisConnectionFactory(): RedisConnectionFactory {
        val redisStandaloneConfiguration: RedisStandaloneConfiguration = RedisStandaloneConfiguration()
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

        return LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    /**
     * 커스텀 RedisTemplate 설정
     * 커스터마이징 필요시 하단 코드 사용.
     */
    @Bean
    fun redisTemplate(@Qualifier("redisConnectionFactory") redisConnectionFactory: RedisConnectionFactory): RedisTemplate<String, Any> {
        val stringRedisSerializer = StringRedisSerializer()
        val genericJackson2JsonRedisSerializer = GenericJackson2JsonRedisSerializer(objectMapper)

        return RedisTemplate<String, Any>().apply {
            setConnectionFactory(redisConnectionFactory)
            keySerializer = stringRedisSerializer
            hashKeySerializer = stringRedisSerializer
            valueSerializer = genericJackson2JsonRedisSerializer
            hashValueSerializer = genericJackson2JsonRedisSerializer
        }
    }

    /**
     * 커스텀 StringRedisTemplate 설정
     * 커스터마이징 필요시 하단 코드 사용.
     */
    @Bean
    fun stringRedisTemplate(@Qualifier("redisConnectionFactory") redisConnectionFactory: RedisConnectionFactory): StringRedisTemplate {
        return StringRedisTemplate().apply {
            setConnectionFactory(redisConnectionFactory)
        }
    }
}
