package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm

interface AlarmRepositoryCustom {
    fun getMemberAlarmList(memberId: Long): List<Alarm>
}