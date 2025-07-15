package cc.nobrain.dev.userserver.common.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.auditing.DateTimeProvider
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.util.*

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider", dateTimeProviderRef = "dateTimeProvider")
class AuditorConfig {
    @Bean
    fun auditorProvider(): AuditorAware<String> {
        return UserAuditorAware()
    }

    // your AuditorAware bean goes here...
    @Bean
    fun dateTimeProvider(): DateTimeProvider {
        return DateTimeProvider { Optional.of(OffsetDateTime.now().truncatedTo(ChronoUnit.MILLIS)) }
    }
}

class UserAuditorAware : AuditorAware<String> {

    override fun getCurrentAuditor(): Optional<String> {
        val authentication = SecurityContextHolder.getContext().authentication

        return if(authentication != null &&
            authentication.isAuthenticated &&
            authentication.principal is UserDetails
        ) {
            Optional.ofNullable((authentication.principal as UserDetails).username)
        } else {
            Optional.of("SYSTEM")
        }
    }
}