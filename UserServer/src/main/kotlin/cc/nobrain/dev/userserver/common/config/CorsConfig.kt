package cc.nobrain.dev.userserver.common.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import java.util.*

@Configuration
class CorsConfig {
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = Arrays.asList("http://localhost:3000", "http://toy.dev.nobrain.cc")
        configuration.allowedMethods = Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS");
        configuration.allowedHeaders = Arrays.asList("*");
//        configuration.addAllowedHeader("*")
//        configuration.addAllowedHeader("Authorization")
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:[*]", "http://*.dev.nobrain.cc", "*"));
        configuration.allowCredentials = true;
        val source = UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}