package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto

interface AlarmService {
    suspend fun getMemberAlarmList(memberId: Long): List<AlarmDto>

    suspend fun getMyAlarmList(): List<AlarmDto>

    suspend fun sendAlarmToMember(memberId: Long, title: String, content: String)
}