package cc.nobrain.dev.userserver.common.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {

    @Bean
    fun openAPI(): OpenAPI {
        val jwt = "JWT";
        val securityRequirement = SecurityRequirement().addList(jwt);
        val components: Components = Components().addSecuritySchemes(jwt, SecurityScheme()
            .name(jwt).type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")
        );
        return OpenAPI().components(components).info(apiInfo()).addSecurityItem(securityRequirement);
    }

    fun apiInfo(): Info {
        return Info().title("User Server API").description("User Server API").version("1.0.0");
    }
}