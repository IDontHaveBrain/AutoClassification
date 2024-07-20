package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmMessageDto
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmRes

interface AlarmService {
    suspend fun getMemberAlarmList(memberId: Long): List<AlarmMessageDto>

    suspend fun getMyAlarmList(): List<AlarmRes>

    suspend fun sendAlarmToMember(memberId: Long, title: String, content: String, url: String? = null)

    suspend fun readAlarm(alarmId: Long)

    suspend fun readAllAlarm()
}