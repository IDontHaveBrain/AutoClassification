package cc.nobrain.dev.userserver.common.config

import io.netty.channel.ChannelOption
import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import java.time.Duration
import java.util.concurrent.TimeUnit

@Configuration
class WebClientConfig {

    @Bean
    fun webClient(): WebClient {
        val httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000) // 30 seconds connection timeout
            .responseTimeout(Duration.ofMinutes(10)) // 10 minutes response timeout for AI processing
            .doOnConnected { conn ->
                conn.addHandlerLast(ReadTimeoutHandler(600, TimeUnit.SECONDS)) // 10 minutes read timeout
                    .addHandlerLast(WriteTimeoutHandler(30, TimeUnit.SECONDS)) // 30 seconds write timeout
            }

        return WebClient.builder()
            .clientConnector(ReactorClientHttpConnector(httpClient))
            .codecs { configurer ->
                configurer.defaultCodecs().maxInMemorySize(100 * 1024 * 1024) // 100MB max memory buffer
            }
            .build()
    }
}