package cc.nobrain.dev.userserver.common.component

import lombok.RequiredArgsConstructor
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