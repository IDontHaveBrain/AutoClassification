package cc.nobrain.dev.userserver.domain.alarm.service.dto

import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage

data class AlarmRes(
    val alarmRead: AlarmReadDto? = null,
): AlarmMessageDto() {
}
