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
 * 테스트 전용 보안 설정 클래스
 * 메인 SecurityConfig를 재정의하여 테스트에서 OAuth2 클라이언트 인증이 정상적으로 작동하도록 합니다.
 */
@TestConfiguration
class TestSecurityConfig {

    /**
     * 프로덕션 패스워드 인코더를 {noop} 접두사를 지원하는 위임 인코더로 교체합니다.
     * 이는 테스트에서 OAuth2 클라이언트 인증이 평문 시크릿으로 작동하도록 보장합니다.
     */
    @Bean
    @Primary
    fun testPasswordEncoder(): PasswordEncoder {
        // 테스트에서 {noop} 접두사를 지원하는 위임 인코더를 반환합니다
        return PasswordEncoderFactories.createDelegatingPasswordEncoder()
    }

    /**
     * {noop} 인코딩된 시크릿을 사용하는 테스트 전용 RegisteredClientRepository를 제공합니다.
     */
    @Bean
    @Primary  
    fun testRegisteredClientRepository(): RegisteredClientRepository {
        
        // 인코딩을 우회하기 위해 테스트 클라이언트 시크릿에 {noop} 접두사를 사용합니다  
        val registeredClient = RegisteredClient.withId("public")
            .clientId("public")
            .clientName("public")
            .clientSecret("{noop}public")  // 테스트 환경에서 NoOpPasswordEncoder 접두사
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
                    .accessTokenTimeToLive(Duration.ofSeconds(86400)) // 24시간
                    .refreshTokenTimeToLive(Duration.ofSeconds(604800)) // 7일
                    .reuseRefreshTokens(false) // 토큰 순환 활성화
                    .build()
            )
            .build()

        return InMemoryRegisteredClientRepository(registeredClient)
    }

    /**
     * 테스트 중 실제 이메일 전송을 방지하기 위한 Mock JavaMailSender입니다.
     * 회원 등록 테스트에서 타임아웃 문제를 해결합니다.
     */
    @MockBean
    lateinit var javaMailSender: JavaMailSender

    /**
     * 테스트 중 실제 이메일 전송을 방지하기 위한 Mock EmailService입니다.
     * 이메일 의존성 없이 회원 등록 테스트가 성공적으로 완료되도록 보장합니다.
     */
    @MockBean
    lateinit var emailService: EmailService

}