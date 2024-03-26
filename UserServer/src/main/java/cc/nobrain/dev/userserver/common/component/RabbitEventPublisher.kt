package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.CLASSFIY_RESPONSE_QUEUE
import lombok.RequiredArgsConstructor
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

interface EventPublisher {
    fun publish(routingKey: String, message: Any)
}

@Component
@RequiredArgsConstructor
class RabbitEventPublisher(
    private val rabbitTemplate: RabbitTemplate,
) : EventPublisher {
    override fun publish(routingKey: String, message: Any) {
        rabbitTemplate.convertAndSend(routingKey, message);
    }
}

@Component
class MessageReceiver {

    @RabbitListener(queues = [CLASSFIY_RESPONSE_QUEUE])
    fun receiveMessage(message: String) {
        println("Received message: $message")
        // 메시지 처리 로직
    }
}
