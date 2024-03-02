package cc.nobrain.dev.userserver.common.security

import cc.nobrain.dev.userserver.common.component.RsaHelper
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.*
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator
import org.springframework.util.Assert
import org.springframework.util.StringUtils
import java.util.*

class PasswordProvider(
        private val authorizationService: OAuth2AuthorizationService,
        private val tokenGenerator: OAuth2TokenGenerator<out OAuth2Token>,
        private val customUserDetailService: CustomUserDetailService,
        private val rsaHelper: RsaHelper
) : AuthenticationProvider {

    init {
        Assert.notNull(authorizationService, "authorizationService cannot be null")
        Assert.notNull(tokenGenerator, "tokenGenerator cannot be null")
        Assert.notNull(customUserDetailService, "customUserDetailService cannot be null")
    }

    override fun authenticate(authentication: Authentication): Authentication {
        val passwordAuthenticationToken = authentication as PasswordToken
        val clientPrincipal = getAuthenticatedClientElseThrowInvalidClient(passwordAuthenticationToken)
        val registeredClient = clientPrincipal.registeredClient

        val username = passwordAuthenticationToken.additionalParameters["username"] as String?
        val password = passwordAuthenticationToken.additionalParameters["password"] as String?

        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            throw OAuth2AuthenticationException("invalid")
        }

        val userDetails = customUserDetailService.loadUserByUsername(username!!)
        if (!customUserDetailService.matches(rsaHelper.decrypt(password!!), userDetails.password)) {
            throw OAuth2AuthenticationException("invalid")
        }
        val usernamePasswordAuthenticationToken = UsernamePasswordAuthenticationToken(userDetails.username, null, userDetails.authorities)

        val tokenContext = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(usernamePasswordAuthenticationToken)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .authorizationGrantType(passwordAuthenticationToken.grantType)
                .authorizationGrant(passwordAuthenticationToken)

        val generatedAccessToken = tokenGenerator.generate(tokenContext.tokenType(OAuth2TokenType.ACCESS_TOKEN).build())
                ?: throw OAuth2AuthenticationException("invalid")
        val accessToken = OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER, generatedAccessToken.tokenValue,
                generatedAccessToken.issuedAt, generatedAccessToken.expiresAt
        )

        val generatedRefreshToken = tokenGenerator.generate(tokenContext.tokenType(OAuth2TokenType.REFRESH_TOKEN).build())
                ?: throw OAuth2AuthenticationException("invalid")
        val refreshToken = OAuth2RefreshToken(
                generatedRefreshToken.tokenValue, generatedRefreshToken.issuedAt, generatedRefreshToken.expiresAt
        )

        val authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
                .principalName(clientPrincipal.name)
                .authorizationGrantType(passwordAuthenticationToken.grantType)

        if (generatedAccessToken is ClaimAccessor) {
            authorizationBuilder.token(accessToken) { metadata ->
                    metadata[OAuth2Authorization.Token.CLAIMS_METADATA_NAME] = generatedAccessToken.claims
                metadata[OAuth2Authorization.Token.INVALIDATED_METADATA_NAME] = false
            }.refreshToken(refreshToken)
        } else {
            authorizationBuilder.accessToken(accessToken).refreshToken(refreshToken)
        }

        val authorization = authorizationBuilder.build()
        authorizationService.save(authorization)

        val memberDto = MemberDto(0L, userDetails.username, userDetails.name)

        val additional = HashMap<String, Any>()
        additional["user"] = memberDto

        return OAuth2AccessTokenAuthenticationToken(registeredClient, clientPrincipal, accessToken, refreshToken, additional)
    }

    override fun supports(authentication: Class<*>): Boolean {
        return PasswordToken::class.java.isAssignableFrom(authentication)
    }

    private fun getAuthenticatedClientElseThrowInvalidClient(authentication: Authentication): OAuth2ClientAuthenticationToken {
        val clientPrincipal = authentication.principal as? OAuth2ClientAuthenticationToken

        if (clientPrincipal != null && clientPrincipal.isAuthenticated) {
            return clientPrincipal
        } else {
            throw OAuth2AuthenticationException("invalid_client")
        }
    }
}