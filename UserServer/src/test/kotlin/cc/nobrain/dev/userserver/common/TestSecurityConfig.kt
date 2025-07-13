package cc.nobrain.dev.userserver.common

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import jakarta.annotation.PostConstruct
import org.mockito.Mockito
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings
import org.springframework.mail.javamail.JavaMailSender
import cc.nobrain.dev.userserver.domain.base.service.EmailService
import java.time.Duration

/**
 * Test-specific security configuration that overrides the main SecurityConfig
 * for OAuth2 client authentication to work properly in tests.
 */
@TestConfiguration
class TestSecurityConfig {

    /**
     * Replace the production password encoder with a delegating encoder that supports {noop} prefix
     * This ensures OAuth2 client authentication works with plain text secrets in tests
     */
    @Bean
    @Primary
    fun testPasswordEncoder(): PasswordEncoder {
        // Return the delegating encoder that supports {noop} prefix for tests
        return PasswordEncoderFactories.createDelegatingPasswordEncoder()
    }

    /**
     * Test-specific RegisteredClientRepository that uses {noop} encoded secrets
     */
    @Bean
    @Primary  
    fun testRegisteredClientRepository(): RegisteredClientRepository {
        
        // Use {noop} prefix for test client secrets to bypass encoding  
        val registeredClient = RegisteredClient.withId("public")
            .clientId("public")
            .clientName("public")
            .clientSecret("{noop}public")  // NoOpPasswordEncoder prefix for test environment
            .clientAuthenticationMethods { methods ->
                methods.add(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                methods.add(ClientAuthenticationMethod.NONE)
            }
            .clientSettings(ClientSettings.builder().requireAuthorizationConsent(false).build())
            .authorizationGrantTypes { grant ->
                grant.add(AuthorizationGrantType("client_password"))
                grant.add(AuthorizationGrantType.PASSWORD)
                grant.add(AuthorizationGrantType.REFRESH_TOKEN)
                grant.add(AuthorizationGrantType.AUTHORIZATION_CODE)
            }
            .redirectUris { uris -> uris.add("http://client/oauth/callback") }
            .scopes { scopes ->
                scopes.add("user")
                scopes.add("admin")
            }
            .tokenSettings(
                TokenSettings.builder()
                    .accessTokenTimeToLive(Duration.ofSeconds(86400)) // 24 hours
                    .refreshTokenTimeToLive(Duration.ofSeconds(604800)) // 7 days
                    .build()
            )
            .build()

        return InMemoryRegisteredClientRepository(registeredClient)
    }

    /**
     * Mock JavaMailSender to prevent actual email sending during tests
     * This resolves timeout issues in member registration tests
     */
    @MockBean
    lateinit var javaMailSender: JavaMailSender

    /**
     * Mock EmailService to prevent actual email sending during tests
     * This ensures member registration tests complete successfully without email dependencies
     */
    @MockBean
    lateinit var emailService: EmailService

}