package cc.nobrain.dev.userserver.common.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class PasswordConverter implements AuthenticationConverter {
    @Override
    public Authentication convert(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        MultiValueMap<String, String> parameters = new LinkedMultiValueMap();
        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            if (entry.getValue() != null && entry.getValue().length > 0) {
                parameters.add(entry.getKey(), entry.getValue()[0]);
            }
        }

        String grantType = (String)parameters.getFirst("grant_type");
        if (!AuthorizationGrantType.PASSWORD.getValue().equals(grantType)) {
            return null;
        }

        String username = parameters.getFirst("username");
        String password = parameters.getFirst("password");
        if (Objects.isNull(username) || Objects.isNull(password)) {
            throw new OAuth2AuthenticationException("invalid");
        }

        Map<String, Object> additionalParameters = new HashMap();
        parameters.forEach((key, value) -> {
            if (!key.equals("grant_type") && !key.equals("refresh_token")) {
                additionalParameters.put(key, value.size() == 1 ? value.get(0) : value.toArray(new String[0]));
            }
        });

        Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

        return new PasswordToken(clientPrincipal, additionalParameters);
    }
}
