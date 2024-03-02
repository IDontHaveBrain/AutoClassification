package cc.nobrain.dev.userserver.domain.alarm.service.dto

import java.io.Serializable
import java.time.OffsetDateTime

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.alarm.entity.AlarmRead}
 */
open class AlarmReadDto(
    var id: Long? = null,
    var readYn: Boolean? = null,
    var deleteYn: Boolean? = null,
    var readAt: OffsetDateTime? = null,
    var deleteAt: OffsetDateTime? = null
) : Serializable