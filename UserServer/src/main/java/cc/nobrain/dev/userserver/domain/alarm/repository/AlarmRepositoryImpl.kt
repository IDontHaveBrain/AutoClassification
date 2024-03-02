package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm
import cc.nobrain.dev.userserver.domain.alarm.entity.QAlarm
import cc.nobrain.dev.userserver.domain.member.entity.QMember
import cc.nobrain.dev.userserver.domain.member.entity.QMemberGroup
import com.querydsl.jpa.impl.JPAQueryFactory
import org.springframework.stereotype.Repository

@Repository
class AlarmRepositoryImpl(
    private val factory: JPAQueryFactory
) : AlarmRepositoryCustom {

    override fun getMemberAlarmList(memberId: Long): List<Alarm> {
        return factory.selectFrom(QAlarm.alarm)
            .join(QAlarm.alarm.alarmTarget.any().targetMember, QMember.member)
            .where(
                AlarmDslHelper.memberAlarm(memberId)
                    ?.or(QAlarm.alarm.alarmTarget.any().targetGroup.id.eq(QMemberGroup.memberGroup.id))
            ).fetch()
    }
}