package cc.nobrain.dev.userserver.common.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.url")
data class UrlProps(
        val ai: String,
)