package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage_
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTarget_
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import cc.nobrain.dev.userserver.domain.member.entity.MemberGroup_
import cc.nobrain.dev.userserver.domain.member.entity.Member_
import jakarta.persistence.criteria.JoinType
import org.springframework.data.jpa.domain.Specification

object AlarmMessageSpecs {

    fun titleLike(title: String?): Specification<AlarmMessage> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(title)) {
                null
            } else {
                builder.like(root.get("title"), "%$title%")
            }
        }
    }

    fun contentLike(content: String?): Specification<AlarmMessage> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(content)) {
                null
            } else {
                builder.like(root.get("content"), "%$content%")
            }
        }
    }

    fun memberAlarm(memberId: Long?): Specification<AlarmMessage> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(memberId)) {
                return@Specification null
            }

            val alarmTarget = root.join(AlarmMessage_.alarmTarget, JoinType.LEFT)
            val member = alarmTarget.join(AlarmTarget_.targetMember, JoinType.LEFT)
            val memberGroup = member.join(Member_.memberGroup, JoinType.LEFT)

            builder.or(
                builder.and(
                    builder.isNotEmpty(root.get(AlarmMessage_.alarmTarget)),
                    builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.ALL)
                ),
                builder.equal(alarmTarget.get(AlarmTarget_.targetMember).get(Member_.id), memberId),
                builder.equal(alarmTarget.get(AlarmTarget_.targetGroup).get(MemberGroup_.id), memberGroup.get(MemberGroup_.id))
            )
        }
    }
}