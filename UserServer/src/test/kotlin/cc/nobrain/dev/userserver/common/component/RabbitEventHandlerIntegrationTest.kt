package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import cc.nobrain.dev.userserver.domain.train.service.dto.WorkspaceClassfiy
import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.mockito.Mockito.*
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class RabbitEventHandlerIntegrationTest {

    @Autowired
    private lateinit var rabbitEventPublisher: RabbitEventPublisher

    @Autowired
    private lateinit var messageReceiver: MessageReceiver

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var trainService: TrainService

    @MockBean
    private lateinit var alarmService: AlarmService

    @Autowired
    private lateinit var rabbitTemplate: RabbitTemplate

    @BeforeEach
    fun setup() {
        reset(trainService, alarmService)
    }

    @Test
    fun `test end-to-end message flow`() = runBlocking {
        val routingKey = "test.route"
        val workspaceClassfiy = WorkspaceClassfiy("123", listOf(WorkspaceClassfiy.LabelAndId("test", "456")))
        val message = objectMapper.writeValueAsString(workspaceClassfiy)

        `when`(trainService.updateFileLabels(any())).thenReturn(Unit)
        `when`(alarmService.sendAlarmToMember(any(), any(), any())).thenReturn(Unit)

        rabbitEventPublisher.publish(routingKey, message)

        // Wait for message processing
        Thread.sleep(1000)

        verify(trainService, times(1)).updateFileLabels(workspaceClassfiy.labelsAndIds)
        verify(alarmService, times(1)).sendAlarmToMember("123", "Classification Complete", "Your workspace classification is complete.")
    }
}
