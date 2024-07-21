package cc.nobrain.dev.userserver.domain.sse.service.dto

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@JsonInclude(JsonInclude.Include.NON_NULL)
data class SseMessageDto(
    val id: String? = null,
    val type: SseEventType,
    val message: Any,
    val timestamp: Long = System.currentTimeMillis()
) {
    companion object {
        private val logger = LoggerFactory.getLogger(SseMessageDto::class.java)
    }

    @Component
    class SseMessageDtoSerializer @Autowired constructor(private val objectMapper: ObjectMapper) {
        fun serialize(sseMessageDto: SseMessageDto): String {
            return try {
                objectMapper.writeValueAsString(sseMessageDto)
            } catch (e: JsonProcessingException) {
                logger.error("Error serializing SseMessageDto", e)
                "{\"error\":\"Error serializing message\",\"type\":\"${sseMessageDto.type}\",\"timestamp\":${sseMessageDto.timestamp}}"
            }
        }
    }

    override fun toString(): String {
        return SseMessageDtoSerializer(ObjectMapper().apply {
            registerModule(JavaTimeModule())
            registerModule(KotlinModule.Builder().build())
        }).serialize(this)
    }

    fun validate(): Boolean {
        return when (type) {
            SseEventType.HEARTBEAT -> true
            SseEventType.ALARM, SseEventType.NOTICE, SseEventType.MESSAGE -> message.toString().isNotBlank()
            else -> false
        }
    }
}
