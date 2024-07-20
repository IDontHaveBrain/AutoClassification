package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.CLASSFIY_RESPONSE_QUEUE
import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import cc.nobrain.dev.userserver.domain.train.service.dto.WorkspaceClassfiy
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.*

interface EventPublisher {
    fun publish(routingKey: String, message: Any)
}

@Component
class RabbitEventPublisher(
    private val rabbitTemplate: RabbitTemplate,
) : EventPublisher {
    override fun publish(routingKey: String, message: Any) {
//        val correlationId = UUID.randomUUID().toString()
        rabbitTemplate.convertAndSend("", routingKey, message)
    }
}

@Component
class MessageReceiver(
    private val trainService: TrainService,
    private val alarmService: AlarmService,
    private val objectMapper: ObjectMapper,
) {

    @RabbitListener(queues = [CLASSFIY_RESPONSE_QUEUE])
    @Transactional
    suspend fun receiveMessage(message: String) {
        println("Received message: $message")
        // 메시지 처리 로직

        val workspaceClassfiy = objectMapper.readValue(message, WorkspaceClassfiy::class.java)

        trainService.updateFileLabels(workspaceClassfiy.labelsAndIds)

        alarmService.sendAlarmToMember(workspaceClassfiy.requesterId, "test", "test");
    }
}
