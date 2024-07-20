package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.domain.alarm.entity.*
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.Member_.id
import cc.nobrain.dev.userserver.domain.member.entity.Member_.memberGroup
import org.springframework.data.jpa.domain.Specification
import jakarta.persistence.criteria.*

object AlarmSpecs {
    fun findAlarmByMemberId(memberId: Long?): Specification<AlarmMessage> {
        return Specification { root: Root<AlarmMessage>, query: CriteriaQuery<*>, builder: CriteriaBuilder ->

            if (memberId == null) {
                return@Specification null
            }

            val readFetch: Fetch<AlarmMessage, AlarmRead> = root.fetch(AlarmMessage_.alarmRead, JoinType.LEFT)

            val alarmMessageTarget: Join<AlarmMessage, AlarmTarget> = root.join(AlarmMessage_.alarmTarget, JoinType.LEFT)
            val member: Join<AlarmTarget, Member> = alarmMessageTarget.join(AlarmTarget_.targetMember, JoinType.LEFT)

            val memberTargetId: Predicate = builder.equal(member.get(id), memberId)
            val memberGroup: Predicate = builder.equal(member.get(memberGroup), alarmMessageTarget.get(AlarmTarget_.targetGroup))

            val targetTypeAll: Predicate = builder.equal(alarmMessageTarget.get(AlarmTarget_.targetType), AlarmTargetType.ALL)
            val targetTypeMember: Predicate = builder.equal(alarmMessageTarget.get(AlarmTarget_.targetType), AlarmTargetType.MEMBER)
            val targetTypeGroup: Predicate = builder.equal(alarmMessageTarget.get(AlarmTarget_.targetType), AlarmTargetType.GROUP)

            val memberCondition: Predicate = builder.and(targetTypeMember, memberTargetId)
            val groupCondition: Predicate = builder.and(targetTypeGroup, memberGroup)

            val alarmRead: Join<AlarmMessage, AlarmRead> = root.join(AlarmMessage_.alarmRead, JoinType.LEFT)
            val readYnCondition: Predicate = builder.or(builder.isNull(alarmRead), builder.equal(alarmRead.get(AlarmRead_.readYn), false))
            val deleteYnCondition: Predicate = builder.equal(alarmRead.get(AlarmRead_.deleteYn), false)
            val readAndDeleteCondition: Predicate = builder.and(readYnCondition, deleteYnCondition)

            val alarmReadIsNull: Predicate = builder.isNull(alarmRead)
            val finalCondition: Predicate = builder.or(alarmReadIsNull, readAndDeleteCondition)

            builder.and(builder.or(targetTypeAll, memberCondition, groupCondition), finalCondition)
        }
    }
}