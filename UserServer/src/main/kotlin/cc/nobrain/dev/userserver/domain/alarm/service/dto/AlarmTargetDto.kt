package cc.nobrain.dev.userserver.domain.alarm.service.dto;

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import cc.nobrain.dev.userserver.domain.base.dto.BaseDto;

import java.io.Serializable;

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTarget}
 */


open class AlarmTargetDto(
    var id: Long? = null,
    var targetType: AlarmTargetType? = null
) : BaseDto(), Serializable