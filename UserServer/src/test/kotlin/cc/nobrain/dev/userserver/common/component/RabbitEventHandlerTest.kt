package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import cc.nobrain.dev.userserver.domain.train.service.dto.WorkspaceClassfiy
import com.fasterxml.jackson.databind.ObjectMapper
import io.mockk.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.amqp.AmqpRejectAndDontRequeueException
import org.springframework.amqp.rabbit.core.RabbitTemplate
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class RabbitEventHandlerTest {

    private lateinit var rabbitTemplate: RabbitTemplate
    private lateinit var rabbitEventPublisher: RabbitEventPublisher
    private lateinit var trainService: TrainService
    private lateinit var alarmService: AlarmService
    private lateinit var objectMapper: ObjectMapper
    private lateinit var messageReceiver: MessageReceiver

    @BeforeEach
    fun setup() {
        rabbitTemplate = mockk(relaxed = true)
        rabbitEventPublisher = RabbitEventPublisher(rabbitTemplate)
        trainService = mockk(relaxed = true)
        alarmService = mockk(relaxed = true)
        objectMapper = mockk(relaxed = true)
        messageReceiver = MessageReceiver(trainService, alarmService, objectMapper)
    }

    @Test
    fun `test publish message`() {
        val routingKey = "test.route"
        val message = "Test message"

        rabbitEventPublisher.publish(routingKey, message)

        verify { rabbitTemplate.convertAndSend("", routingKey, message, any()) }
    }

    @Test
    fun `test publish message with retry`() {
        val routingKey = "test.route"
        val message = "Test message"

        every { rabbitTemplate.convertAndSend("", routingKey, message, any()) } throws RuntimeException() andThenThrows RuntimeException() andThen Unit

        assertFailsWith<RuntimeException> {
            rabbitEventPublisher.publish(routingKey, message)
        }

        verify(exactly = 3) { rabbitTemplate.convertAndSend("", routingKey, message, any()) }
    }

    @Test
    fun `test receive message successfully`() = runBlocking {
        val message = """{"requesterId":"123","labelsAndIds":[{"label":"test","id":"456"}]}"""
        val workspaceClassfiy = WorkspaceClassfiy("123", listOf(WorkspaceClassfiy.LabelAndId("test", "456")))

        every { objectMapper.readValue(message, WorkspaceClassfiy::class.java) } returns workspaceClassfiy

        coEvery { trainService.updateFileLabels(any()) } just Runs
        coEvery { alarmService.sendAlarmToMember(any(), any(), any()) } just Runs

        messageReceiver.receiveMessage(message)

        coVerify { trainService.updateFileLabels(workspaceClassfiy.labelsAndIds) }
        coVerify { alarmService.sendAlarmToMember("123", "Classification Complete", "Your workspace classification is complete.") }
    }

    @Test
    fun `test receive message with error`() = runBlocking {
        val message = """{"requesterId":"123","labelsAndIds":[{"label":"test","id":"456"}]}"""

        every { objectMapper.readValue(message, WorkspaceClassfiy::class.java) } throws RuntimeException("Parse error")

        assertFailsWith<AmqpRejectAndDontRequeueException> {
            messageReceiver.receiveMessage(message)
        }

        coVerify(exactly = 0) { trainService.updateFileLabels(any()) }
        coVerify(exactly = 0) { alarmService.sendAlarmToMember(any(), any(), any()) }
    }
}
