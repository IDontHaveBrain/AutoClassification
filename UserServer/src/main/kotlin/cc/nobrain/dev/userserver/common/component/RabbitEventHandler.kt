package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.RESPONSE_QUEUE
import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import cc.nobrain.dev.userserver.domain.train.service.dto.WorkspaceClassfiy
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.amqp.AmqpRejectAndDontRequeueException
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.retry.annotation.Backoff
import org.springframework.retry.annotation.Retryable
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.*
import org.slf4j.LoggerFactory

interface EventPublisher {
    fun publish(routingKey: String, message: Any)
}

@Component
class RabbitEventPublisher(
    private val rabbitTemplate: RabbitTemplate,
) : EventPublisher {
    private val logger = LoggerFactory.getLogger(RabbitEventPublisher::class.java)

    @Retryable(
        value = [Exception::class],
        maxAttempts = 3,
        backoff = Backoff(delay = 1000, multiplier = 2.0)
    )
    override fun publish(routingKey: String, message: Any) {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Publishing message with correlationId: $correlationId to routingKey: $routingKey")
        try {
            rabbitTemplate.convertAndSend("", routingKey, message) { msg ->
                msg.messageProperties.correlationId = correlationId
                msg
            }
            logger.info("Message published successfully with correlationId: $correlationId")
        } catch (e: Exception) {
            logger.error("Error publishing message with correlationId: $correlationId", e)
            throw e
        }
    }
}

@Component
class MessageReceiver(
    private val trainService: TrainService,
    private val alarmService: AlarmService,
    private val objectMapper: ObjectMapper,
) {
    private val logger = LoggerFactory.getLogger(MessageReceiver::class.java)

    @RabbitListener(queues = [RESPONSE_QUEUE])
    @Transactional
    @Retryable(
        value = [Exception::class],
        maxAttempts = 3,
        backoff = Backoff(delay = 1000, multiplier = 2.0)
    )
    suspend fun receiveMessage(message: String) {
        logger.info("Received message: $message")
        try {
            val workspaceClassfiy = objectMapper.readValue(message, WorkspaceClassfiy::class.java)
            
            trainService.updateFileLabels(workspaceClassfiy.labelsAndIds)
            
            alarmService.sendAlarmToMember(workspaceClassfiy.requesterId, "Classification Complete", "Your workspace classification is complete.")
            
            logger.info("Message processed successfully for requesterId: ${workspaceClassfiy.requesterId}")
        } catch (e: Exception) {
            logger.error("Error processing message", e)
            throw AmqpRejectAndDontRequeueException("Error processing message", e)
        }
    }
}
