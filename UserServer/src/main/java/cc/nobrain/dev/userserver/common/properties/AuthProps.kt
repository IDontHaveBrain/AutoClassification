package cc.nobrain.dev.userserver.common.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "spring.security.jwt")
data class AuthProps(
        val privateKey: String,
        val signKey: String,
        val accessTokenValiditySeconds: Long,
        val refreshTokenValiditySeconds: Long
)