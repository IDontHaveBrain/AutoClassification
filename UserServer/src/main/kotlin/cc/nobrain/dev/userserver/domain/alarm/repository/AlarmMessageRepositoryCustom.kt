package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage

interface AlarmMessageRepositoryCustom {
    fun getMemberAlarmList(memberId: Long): List<AlarmMessage>
}