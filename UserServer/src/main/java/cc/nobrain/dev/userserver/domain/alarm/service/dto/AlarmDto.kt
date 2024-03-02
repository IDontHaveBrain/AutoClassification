package cc.nobrain.dev.userserver.domain.alarm.service.dto

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType
import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import java.io.Serializable

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.alarm.entity.Alarm}
 */
open class AlarmDto(
    val id: Long? = null,
    val title: String? = null,
    val content: String? = null,
    val eventType: AlarmEventType? = null
) : BaseDto(), Serializable