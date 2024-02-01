package cc.nobrain.dev.userserver.security;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder;
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class PasswordAuthProvider implements AuthenticationProvider {

    private final OAuth2AuthorizationService authorizationService;
    private final OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator;
    private final CustomUserDetailService customUserDetailService;

    public PasswordAuthProvider(OAuth2AuthorizationService authorizationService, OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator, CustomUserDetailService customUserDetailService) {
        Assert.notNull(authorizationService, "authorizationService cannot be null");
        Assert.notNull(tokenGenerator, "tokenGenerator cannot be null");
        Assert.notNull(customUserDetailService, "customUserDetailService cannot be null");
        this.authorizationService = authorizationService;
        this.tokenGenerator = tokenGenerator;
        this.customUserDetailService = customUserDetailService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        PasswordAuthToken passwordAuthenticationToken = (PasswordAuthToken) authentication;
        OAuth2ClientAuthenticationToken clientPrincipal = getAuthenticatedClientElseThrowInvalidClient(passwordAuthenticationToken);
        RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();

        String username = (String) passwordAuthenticationToken.getAdditionalParameters().get("username");
        String password = (String) passwordAuthenticationToken.getAdditionalParameters().get("password");

        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            throw new OAuth2AuthenticationException("invalid");
        }

        Member userDetails = (Member) customUserDetailService.loadUserByUsername(username);
        if (!PasswordConfig.passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new OAuth2AuthenticationException("invalid");
        }

        DefaultOAuth2TokenContext.Builder tokenContext = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(clientPrincipal)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .authorizationGrantType(passwordAuthenticationToken.getGrantType())
                .authorizationGrant(passwordAuthenticationToken);

        OAuth2Token generatedAccessToken = tokenGenerator.generate(tokenContext.tokenType(OAuth2TokenType.ACCESS_TOKEN).build());
        if (Objects.isNull(generatedAccessToken)) {
            throw new OAuth2AuthenticationException("invalid");
        }
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER, generatedAccessToken.getTokenValue(),
                generatedAccessToken.getIssuedAt(), generatedAccessToken.getExpiresAt()
        );

        OAuth2Token generatedRefreshToken = tokenGenerator.generate(tokenContext.tokenType(OAuth2TokenType.REFRESH_TOKEN).build());
        if (Objects.isNull(generatedRefreshToken)) {
            throw new OAuth2AuthenticationException("invalid");
        }
        OAuth2RefreshToken refreshToken = new OAuth2RefreshToken(
                generatedRefreshToken.getTokenValue(), generatedRefreshToken.getIssuedAt(), generatedRefreshToken.getExpiresAt()
        );

        OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
                .principalName(clientPrincipal.getName())
                .authorizationGrantType(passwordAuthenticationToken.getGrantType());

        if (generatedAccessToken instanceof ClaimAccessor) {
            authorizationBuilder.token(accessToken, (metadata) -> {
                metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims());
            }).refreshToken(refreshToken);
        } else {
            authorizationBuilder.accessToken(accessToken).refreshToken(refreshToken);
        }

        OAuth2Authorization authorization = authorizationBuilder.build();
        authorizationService.save(authorization);

        MemberDto memberDto = new MemberDto(0L, userDetails.getUsername(), userDetails.getName());

        Map<String, Object> additional = new HashMap<>();
        additional.put("info", memberDto);

        return new OAuth2AccessTokenAuthenticationToken(registeredClient, clientPrincipal, accessToken, refreshToken, additional);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return PasswordAuthToken.class.isAssignableFrom(authentication);
    }

    private OAuth2ClientAuthenticationToken getAuthenticatedClientElseThrowInvalidClient(Authentication authentication) {
        OAuth2ClientAuthenticationToken clientPrincipal = null;
        if (OAuth2ClientAuthenticationToken.class.isAssignableFrom(authentication.getPrincipal().getClass())) {
            clientPrincipal = (OAuth2ClientAuthenticationToken)authentication.getPrincipal();
        }

        if (clientPrincipal != null && clientPrincipal.isAuthenticated()) {
            return clientPrincipal;
        } else {
            throw new OAuth2AuthenticationException("invalid_client");
        }
    }
}
