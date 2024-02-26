package cc.nobrain.dev.userserver.common.security;

import cc.nobrain.dev.userserver.common.component.RsaHelper;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.util.*;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${spring.security.jwt.privateKey}")
    private String privateKey;
    @Value("${spring.security.jwt.signKey}")
    private String signKey;
    @Value("${spring.security.jwt.accessTokenValiditySeconds:43200}")
    private Integer accessTokenValiditySeconds;
    @Value("${spring.security.jwt.refreshTokenValiditySeconds:86400}")
    private Integer refreshTokenValiditySeconds;

    private final CorsConfigurationSource corsConfigurationSource;
    private final CustomUserDetailService customUserDetailService;

    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(
            HttpSecurity http, OAuth2AuthorizationService authorizationService, OAuth2TokenGenerator tokenGenerator,
            AuthorizationServerSettings authorizationServerSettings, RegisteredClientRepository registeredClientRepository,
            RsaHelper rsaHelper, JwtDecoder jwtDecoder) throws Exception {

        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

//        OAuth2AuthorizationServerConfigurer oAuth2AuthorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();
//        http.apply(oAuth2AuthorizationServerConfigurer);

        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .tokenGenerator(tokenGenerator)
                .clientAuthentication(clientAuth -> clientAuth
                                .authenticationConverters(converters -> {
//                            converters.clear();
                                })
                )
                .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint
                        .authorizationRequestConverters(test -> {
                        })
                        .authenticationProviders(providers -> {
                        })
                )
                .tokenEndpoint(tokenEndpoint -> tokenEndpoint
                                .accessTokenRequestConverters(converters -> {
                                    converters.add(new PasswordConverter());
//                            converters.add(new OAuth2RefreshTokenAuthenticationConverter());
                                })
                                .authenticationProviders(providers -> {
                                    providers.add(new PasswordProvider(authorizationService, tokenGenerator, customUserDetailService, rsaHelper));
//                            providers.add(new OAuth2RefreshTokenAuthenticationProvider(authorizationService, tokenGenerator));
                                })
                )
                .registeredClientRepository(registeredClientRepository)
                .authorizationServerSettings(authorizationServerSettings)
                .authorizationService(authorizationService)
        ;


        http.cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http, JwtDecoder jwtDecoder) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource)).csrf(csrf -> csrf.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .userDetailsService(customUserDetailService)
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> {
                                    jwt.decoder(jwtDecoder);
                                    jwt.jwtAuthenticationConverter(new CustomJwtAuthenticationConverter(customUserDetailService));
                                }
                        )
                )
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/authorize").permitAll()
//                        .anyRequest().permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
        ;
        return http.build();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository(PasswordEncoder passwordEncoder) {
        String secret = passwordEncoder.encode("123123");

        RegisteredClient registeredClientRepository = RegisteredClient.withId("public")
                .clientId("public")
                .clientName("public")
                .clientSecret("$2a$10$d5nJ4FfbF0yLD2sgQ3EbpOqOBEQJn5rX2v/Fv/nGHPjfurbGl9tXy")
                .clientAuthenticationMethods(methods -> {
//                    methods.add(ClientAuthenticationMethod.NONE);
                    methods.add(ClientAuthenticationMethod.CLIENT_SECRET_POST);
                    methods.add(ClientAuthenticationMethod.NONE);
                })
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(false).build())
                .authorizationGrantTypes(grant -> {
                    grant.add(new AuthorizationGrantType("client_password"));
                    grant.add(AuthorizationGrantType.PASSWORD);
                    grant.add(AuthorizationGrantType.REFRESH_TOKEN);
                    grant.add(AuthorizationGrantType.AUTHORIZATION_CODE);
                })
                .redirectUris(uris -> uris.add("http://client/oauth/callback"))
                .scopes(scopes -> {
                    scopes.add("user");
                    scopes.add("admin");
                })
                .tokenSettings(tokenSettings())
                .build();

        return new InMemoryRegisteredClientRepository(registeredClientRepository);
    }

    @Bean
    public OAuth2AuthorizationService authorizationService() {
        // TODO: REDIS 기반으로 변경
//        OAuth2AuthorizationService authorizationService = new InMemoryOAuth2AuthorizationService();
        return new InMemoryOAuth2AuthorizationService();
    }

    @Bean
    public OAuth2TokenGenerator<?> tokenGenerator(JWKSource<SecurityContext> jwkSource) {
        JwtEncoder jwtEncoder = new NimbusJwtEncoder(jwkSource);
        JwtGenerator jwtGenerator = new JwtGenerator(jwtEncoder);
        OAuth2AccessTokenGenerator accessTokenGenerator = new OAuth2AccessTokenGenerator();
        OAuth2RefreshTokenGenerator refreshTokenGenerator = new OAuth2RefreshTokenGenerator();
        return new DelegatingOAuth2TokenGenerator(
                jwtGenerator, accessTokenGenerator, refreshTokenGenerator);
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        try {
            byte[] privateDecodedKey = Base64.getDecoder().decode(privateKey.getBytes(StandardCharsets.UTF_8));
            PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateDecodedKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) keyFactory.generatePrivate(privateKeySpec);

            byte[] signDecodedKey = Base64.getDecoder().decode(signKey.getBytes(StandardCharsets.UTF_8));
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(signDecodedKey);
            RSAPublicKey rsaPublicKey = (RSAPublicKey) keyFactory.generatePublic(publicKeySpec);

            RSAKey rsaKey = new RSAKey.Builder(rsaPublicKey)
                    .privateKey(rsaPrivateKey)
                    .keyID(UUID.randomUUID().toString())
                    .algorithm(JWSAlgorithm.RS256)
                    .build();

            JWKSet jwkSet = new JWKSet(rsaKey);
            return new ImmutableJWKSet<>(jwkSet);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
        try {
            byte[] signDecodedKey = Base64.getDecoder().decode(signKey.getBytes(StandardCharsets.UTF_8));
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(signDecodedKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(publicKeySpec);


            return NimbusJwtDecoder.withPublicKey(publicKey).signatureAlgorithm(SignatureAlgorithm.RS256).build();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .authorizationEndpoint("/authorize")
                .tokenEndpoint("/auth/token")
                .issuer("https://dev.nobrain.cc")
                .build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailService;
    }

//    @Bean
//    public AuthenticationManager customAuthenticationManager(OAuth2AuthorizationService authorizationService, OAuth2TokenGenerator tokenGenerator) {
//        return new ProviderManager(Arrays.asList(
//                new PasswordAuthProvider(authorizationService, tokenGenerator, customUserDetailService),
//                new OAuth2RefreshTokenAuthenticationProvider(authorizationService, tokenGenerator)
//        ));
//    }

    private TokenSettings tokenSettings() {
        return TokenSettings.builder()
                .accessTokenTimeToLive(Duration.ofSeconds(accessTokenValiditySeconds))
                .refreshTokenTimeToLive(Duration.ofSeconds(refreshTokenValiditySeconds))
                .build();
    }
}
