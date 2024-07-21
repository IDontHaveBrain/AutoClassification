package cc.nobrain.dev.userserver.common.security

import cc.nobrain.dev.userserver.common.component.RsaHelper
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.source.ImmutableJWKSet
import com.nimbusds.jose.jwk.source.JWKSource
import com.nimbusds.jose.proc.SecurityContext
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings
import org.springframework.security.oauth2.server.authorization.token.*
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfigurationSource
import java.nio.charset.StandardCharsets
import java.security.KeyFactory
import java.security.NoSuchAlgorithmException
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.security.spec.InvalidKeySpecException
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.time.Duration
import java.util.*

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val corsConfigurationSource: CorsConfigurationSource,
    private val customUserDetailService: CustomUserDetailService
) {

    @Value("\${spring.security.jwt.privateKey}")
    private lateinit var privateKey: String

    @Value("\${spring.security.jwt.signKey}")
    private lateinit var signKey: String

    @Value("\${spring.security.jwt.accessTokenValiditySeconds:43200}")
    private var accessTokenValiditySeconds: Int = 0

    @Value("\${spring.security.jwt.refreshTokenValiditySeconds:86400}")
    private var refreshTokenValiditySeconds: Int = 0

    @Bean
    @Order(1)
    @Throws(Exception::class)
    fun authorizationServerSecurityFilterChain(
        http: HttpSecurity,
        authorizationService: OAuth2AuthorizationService,
        tokenGenerator: OAuth2TokenGenerator<*>,
        authorizationServerSettings: AuthorizationServerSettings,
        registeredClientRepository: RegisteredClientRepository,
        rsaHelper: RsaHelper,
        jwtDecoder: JwtDecoder
    ): SecurityFilterChain {
//        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http)
//        http.getConfigurer(OAuth2AuthorizationServerConfigurer::class.java)
        val authorizationServerConfigurer = OAuth2AuthorizationServerConfigurer()
        http
            .with(authorizationServerConfigurer) { oauth2 ->
                oauth2
                    .tokenGenerator(tokenGenerator)
                    .clientAuthentication { clientAuth ->
                        clientAuth.authenticationConverters { }
                    }
                    .authorizationEndpoint { authorizationEndpoint ->
                        authorizationEndpoint.authorizationRequestConverters { }
                            .authenticationProviders { }
                    }
                    .tokenEndpoint { tokenEndpoint ->
                        tokenEndpoint.accessTokenRequestConverters { converters ->
                            converters.add(PasswordConverter())
                        }
                            .authenticationProviders { providers ->
                                providers.add(
                                    PasswordProvider(
                                        authorizationService,
                                        tokenGenerator,
                                        customUserDetailService,
                                        rsaHelper
                                    )
                                )
                            }
                    }
                    .registeredClientRepository(registeredClientRepository)
                    .authorizationServerSettings(authorizationServerSettings)
                    .authorizationService(authorizationService)
            }

        http.cors { cors -> cors.configurationSource(corsConfigurationSource) }
            .csrf { csrf -> csrf.disable() }
            .formLogin { form -> form.disable() }
            .httpBasic { httpBasic -> httpBasic.disable() }
            .sessionManagement { session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .userDetailsService(customUserDetailService)
            .oauth2ResourceServer { oauth2 ->
            oauth2.jwt { jwt ->
                jwt.decoder(jwtDecoder)
                jwt.jwtAuthenticationConverter(CustomJwtAuthenticationConverter(customUserDetailService))
            }}
            .authorizeHttpRequests { authorize ->
                authorize
                    .requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/api/**").permitAll()
                    .requestMatchers("/authorize").permitAll()
                    .requestMatchers("/public/**").permitAll()
                    .requestMatchers("/workspace/**").permitAll()
                    .requestMatchers("/swagger-ui/**").permitAll()
                    .requestMatchers("/v3/api-docs/**").permitAll()
                    .requestMatchers("/swagger-resources/**").permitAll()
                    .anyRequest().authenticated()
            };

        return http.build();
    }

    @Bean
    fun registeredClientRepository(passwordEncoder: PasswordEncoder): RegisteredClientRepository {

        val registeredClientRepository = RegisteredClient.withId("public")
            .clientId("public")
            .clientName("public")
            .clientSecret("\$2a\$10\$d5nJ4FfbF0yLD2sgQ3EbpOqOBEQJn5rX2v/Fv/nGHPjfurbGl9tXy")
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
            .tokenSettings(tokenSettings())
            .build()

        return InMemoryRegisteredClientRepository(registeredClientRepository)
    }

    @Bean
    fun authorizationService(): OAuth2AuthorizationService {
        return InMemoryOAuth2AuthorizationService()
    }

    @Bean
    fun tokenGenerator(jwkSource: JWKSource<SecurityContext>): OAuth2TokenGenerator<*> {
        val jwtEncoder = NimbusJwtEncoder(jwkSource)
        val jwtGenerator = JwtGenerator(jwtEncoder)
        val accessTokenGenerator = OAuth2AccessTokenGenerator()
        val refreshTokenGenerator = OAuth2RefreshTokenGenerator()
        return DelegatingOAuth2TokenGenerator(
            jwtGenerator, accessTokenGenerator, refreshTokenGenerator
        )
    }

    @Bean
    fun jwkSource(): JWKSource<SecurityContext> {
        try {
            val privateDecodedKey = Base64.getDecoder().decode(privateKey.toByteArray(StandardCharsets.UTF_8))
            val privateKeySpec = PKCS8EncodedKeySpec(privateDecodedKey)
            val keyFactory = KeyFactory.getInstance("RSA")
            val rsaPrivateKey = keyFactory.generatePrivate(privateKeySpec) as RSAPrivateKey

            val signDecodedKey = Base64.getDecoder().decode(signKey.toByteArray(StandardCharsets.UTF_8))
            val publicKeySpec = X509EncodedKeySpec(signDecodedKey)
            val rsaPublicKey = keyFactory.generatePublic(publicKeySpec) as RSAPublicKey

            val rsaKey = RSAKey.Builder(rsaPublicKey)
                .privateKey(rsaPrivateKey)
                .keyID(UUID.randomUUID().toString())
                .algorithm(JWSAlgorithm.RS256)
                .build()

            val jwkSet = JWKSet(rsaKey)
            return ImmutableJWKSet(jwkSet)
        } catch (ex: NoSuchAlgorithmException) {
            throw IllegalStateException(ex)
        } catch (ex: InvalidKeySpecException) {
            throw IllegalStateException(ex)
        }
    }

    @Bean
    fun jwtDecoder(jwkSource: JWKSource<SecurityContext>): JwtDecoder {
        OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource)
        try {
            val signDecodedKey = Base64.getDecoder().decode(signKey.toByteArray(StandardCharsets.UTF_8))
            val publicKeySpec = X509EncodedKeySpec(signDecodedKey)
            val keyFactory = KeyFactory.getInstance("RSA")
            val publicKey = keyFactory.generatePublic(publicKeySpec) as RSAPublicKey

            return NimbusJwtDecoder.withPublicKey(publicKey).signatureAlgorithm(SignatureAlgorithm.RS256).build()
        } catch (ex: NoSuchAlgorithmException) {
            throw IllegalStateException(ex)
        } catch (ex: InvalidKeySpecException) {
            throw IllegalStateException(ex)
        }
    }

    @Bean
    fun authorizationServerSettings(): AuthorizationServerSettings {
        return AuthorizationServerSettings.builder()
            .authorizationEndpoint("/authorize")
            .tokenEndpoint("/auth/token")
            .issuer("https://dev.nobrain.cc")
            .build()
    }

    @Bean
    fun userDetailsService(): UserDetailsService {
        return customUserDetailService
    }

    private fun tokenSettings(): TokenSettings {
        return TokenSettings.builder()
            .accessTokenTimeToLive(Duration.ofSeconds(accessTokenValiditySeconds.toLong()))
            .refreshTokenTimeToLive(Duration.ofSeconds(refreshTokenValiditySeconds.toLong()))
            .build()
    }
}