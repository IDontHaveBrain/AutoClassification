package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration
import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.CLASSFIY_EXCHANGE
import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.CLASSFIY_RESPONSE_QUEUE
import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.train.service.dto.WorkspaceClassfiy
import com.fasterxml.jackson.databind.ObjectMapper
import lombok.RequiredArgsConstructor
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component
import java.util.*

interface EventPublisher {
    fun publish(routingKey: String, message: Any)
}

@Component
@RequiredArgsConstructor
class RabbitEventPublisher(
    private val rabbitTemplate: RabbitTemplate,
) : EventPublisher {
    override fun publish(routingKey: String, message: Any) {
        val correlationId = UUID.randomUUID().toString()
        rabbitTemplate.convertAndSend(CLASSFIY_EXCHANGE, routingKey, message) { m ->
            m.messageProperties.correlationId = correlationId
            m.messageProperties.replyTo = CLASSFIY_RESPONSE_QUEUE
            m
        }
    }
}

@Component
class MessageReceiver(
    private val alarmService: AlarmService,
    private val objectMapper: ObjectMapper,
) {

    @RabbitListener(queues = [CLASSFIY_RESPONSE_QUEUE], concurrency = "1-3")
    suspend fun receiveMessage(message: String) {
        println("Received message: $message")
        // 메시지 처리 로직

        val workspaceClassfiy = objectMapper.readValue(message, WorkspaceClassfiy::class.java)

        alarmService.sendAlarmToMember(workspaceClassfiy.requesterId, "test", "test");

    }
}
