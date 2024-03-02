package cc.nobrain.dev.userserver.domain.sse.service.dto

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.core.JsonProcessingException

data class SseMessageDto(
        val id: String,
        val type: SseEventType,
        val message: Any
) {
    override fun toString(): String {
        val objectMapper = jacksonObjectMapper()
        return try {
            objectMapper.writeValueAsString(this)
        } catch (e: JsonProcessingException) {
            throw RuntimeException(e)
        }
    }
}