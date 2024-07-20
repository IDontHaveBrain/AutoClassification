package cc.nobrain.dev.userserver.common.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.storage")
data class AppProps(
        val path: String,
        val resourcePath: String,
        val maxFileSize: Long
)