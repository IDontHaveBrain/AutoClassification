package cc.nobrain.dev.userserver.common.config

import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.DirectExchange
import org.springframework.amqp.core.Queue
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfiguration {

    companion object {
        const val CLASSFIY_QUEUE = "ClassfiyQueue"
        const val CLASSFIY_RESPONSE_QUEUE = "ClassfiyResponseQueue"
    }

    @Bean
    fun classfiyQueue(): Queue = Queue(CLASSFIY_QUEUE, true)
    @Bean
    fun classfiyResponseQueue(): Queue = Queue(CLASSFIY_RESPONSE_QUEUE, true)

    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory): RabbitTemplate =
        RabbitTemplate(connectionFactory).apply {
            messageConverter = Jackson2JsonMessageConverter()
        }
}