package cc.nobrain.dev.userserver.domain.sse.service.dto

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.ObjectMapper

data class SseMessageDto(
        val id: String? = null,
        val type: SseEventType,
        val message: Any
) {
    override fun toString(): String {
        val objectMapper = CommonUtil.getBean(ObjectMapper::class.java) as ObjectMapper
        return try {
            objectMapper.writeValueAsString(this)
        } catch (e: JsonProcessingException) {
            throw RuntimeException(e)
        }
    }
}