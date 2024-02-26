package cc.nobrain.dev.userserver.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost**", "http://dev.nobrain.cc**", "*"));
        configuration.setAllowedMethods(Arrays.asList("*"));
        configuration.addAllowedHeader("*");
//        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // source.registerCorsConfiguration("/api/**", configuration);
        // configuration.setAllowCredentials(false);
        // configuration.addAllowedOrigin("*");
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
