package cc.nobrain.dev.userserver.common.security

import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationGrantAuthenticationToken

class PasswordToken(
        clientPrincipal: Authentication,
        additionalParameters: Map<String, Any>
) : OAuth2AuthorizationGrantAuthenticationToken(AuthorizationGrantType.PASSWORD, clientPrincipal, additionalParameters)