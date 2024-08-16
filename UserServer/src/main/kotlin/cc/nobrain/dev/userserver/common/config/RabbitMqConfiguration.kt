package cc.nobrain.dev.userserver.common.config

import org.springframework.amqp.core.*
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfiguration {

    companion object {
        const val CLASSIFY_EXCHANGE = "ClassifyExchange"
        const val CLASSIFY_QUEUE = "ClassifyQueue"
        const val RESPONSE_QUEUE = "ResponseQueue"
        const val TRAIN_EXCHANGE = "TrainExchange"
        const val TRAIN_QUEUE = "TrainQueue"
    }

    @Bean
    fun classifyExchange(): FanoutExchange = FanoutExchange(CLASSIFY_EXCHANGE)

    @Bean
    fun classifyQueue(): Queue = Queue(CLASSIFY_QUEUE, true)

    @Bean
    fun responseQueue(): Queue = Queue(RESPONSE_QUEUE, true)

    @Bean
    fun bindingClassifyQueue(classifyQueue: Queue, classifyExchange: FanoutExchange): Binding =
        BindingBuilder.bind(classifyQueue).to(classifyExchange)

    @Bean
    fun bindingResponseQueue(responseQueue: Queue, classifyExchange: FanoutExchange): Binding =
        BindingBuilder.bind(responseQueue).to(classifyExchange)

    @Bean
    fun trainExchange(): FanoutExchange = FanoutExchange(TRAIN_EXCHANGE)

    @Bean
    fun trainQueue(): Queue = Queue(TRAIN_QUEUE, true)

    @Bean
    fun bindingTrainQueue(trainQueue: Queue, trainExchange: FanoutExchange): Binding =
        BindingBuilder.bind(trainQueue).to(trainExchange)

    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory): RabbitTemplate =
        RabbitTemplate(connectionFactory).apply {
            messageConverter = Jackson2JsonMessageConverter()
        }
}
