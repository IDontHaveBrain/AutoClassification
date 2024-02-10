package cc.nobrain.dev.userserver.common.properties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "spring.security.jwt")
public class AuthProps {

    private final String privateKey;

    private final String signKey;

    private final Long accessTokenValiditySeconds;

    private final Long refreshTokenValiditySeconds;
}
