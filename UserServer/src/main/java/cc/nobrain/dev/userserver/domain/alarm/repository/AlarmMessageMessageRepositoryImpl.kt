package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage
import cc.nobrain.dev.userserver.domain.alarm.entity.QAlarmMessage
import cc.nobrain.dev.userserver.domain.member.entity.QMember
import cc.nobrain.dev.userserver.domain.member.entity.QMemberGroup
import com.querydsl.jpa.impl.JPAQueryFactory
import org.springframework.stereotype.Repository

@Repository
class AlarmMessageMessageRepositoryImpl(
    private val factory: JPAQueryFactory
) : AlarmMessageRepositoryCustom {

    override fun getMemberAlarmList(memberId: Long): List<AlarmMessage> {
        return factory.selectFrom(QAlarmMessage.alarmMessage)
            .join(QAlarmMessage.alarmMessage.alarmTarget.any().targetMember, QMember.member)
            .where(
                AlarmMessageDslHelper.memberAlarm(memberId)
                    ?.or(QAlarmMessage.alarmMessage.alarmTarget.any().targetGroup.id.eq(QMemberGroup.memberGroup.id))
            ).fetch()
    }
}