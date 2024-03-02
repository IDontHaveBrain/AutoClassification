package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.domain.alarm.entity.*
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.Member_.id
import cc.nobrain.dev.userserver.domain.member.entity.Member_.memberGroup
import org.springframework.data.jpa.domain.Specification
import jakarta.persistence.criteria.*

object AlarmSpecs {
    fun findAlarmByMemberId(memberId: Long?): Specification<Alarm> {
        return Specification { root: Root<Alarm>, query: CriteriaQuery<*>, builder: CriteriaBuilder ->

            if (memberId == null) {
                return@Specification null
            }

            val readFetch: Fetch<Alarm, AlarmRead> = root.fetch(Alarm_.alarmRead, JoinType.LEFT)

            val alarmTarget: Join<Alarm, AlarmTarget> = root.join(Alarm_.alarmTarget, JoinType.LEFT)
            val member: Join<AlarmTarget, Member> = alarmTarget.join(AlarmTarget_.targetMember, JoinType.LEFT)

            val memberTargetId: Predicate = builder.equal(member.get(id), memberId)
            val memberGroup: Predicate = builder.equal(member.get(memberGroup), alarmTarget.get(AlarmTarget_.targetGroup))

            val targetTypeAll: Predicate = builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.ALL)
            val targetTypeMember: Predicate = builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.MEMBER)
            val targetTypeGroup: Predicate = builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.GROUP)

            val memberCondition: Predicate = builder.and(targetTypeMember, memberTargetId)
            val groupCondition: Predicate = builder.and(targetTypeGroup, memberGroup)

            builder.or(targetTypeAll, memberCondition, groupCondition)
        }
    }
}