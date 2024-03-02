package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto

interface AlarmService {
    fun getMemberAlarmList(memberId: Long): List<AlarmDto>

    fun getMyAlarmList(): List<AlarmDto>
}