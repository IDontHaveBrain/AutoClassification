package cc.nobrain.dev.userserver.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationGrantAuthenticationToken;

import java.util.Map;

public class PasswordToken extends OAuth2AuthorizationGrantAuthenticationToken {

    public PasswordToken(Authentication clientPrincipal, Map<String, Object> additionalParameters) {
        super(AuthorizationGrantType.PASSWORD, clientPrincipal, additionalParameters);
    }
}
