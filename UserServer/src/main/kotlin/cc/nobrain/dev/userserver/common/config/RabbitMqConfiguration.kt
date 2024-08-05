package cc.nobrain.dev.userserver.common.config

import org.springframework.amqp.core.Queue
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfiguration {

    companion object {
        const val CLASSIFY_QUEUE = "ClassifyQueue"
        const val CLASSIFY_RESPONSE_QUEUE = "ClassifyResponseQueue"
    }

    @Bean
    fun classifyQueue(): Queue = Queue(CLASSIFY_QUEUE, true)
    @Bean
    fun ClassifyResponseQueue(): Queue = Queue(CLASSIFY_RESPONSE_QUEUE, true)

    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory): RabbitTemplate =
        RabbitTemplate(connectionFactory).apply {
            messageConverter = Jackson2JsonMessageConverter()
        }
}