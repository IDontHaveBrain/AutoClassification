package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.alarm.entity.QAlarmMessage
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import com.querydsl.core.types.dsl.BooleanExpression

object AlarmMessageDslHelper {

    fun titleLike(title: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(title)) {
            return null
        }
        return QAlarmMessage.alarmMessage.title.like("%$title%")
    }

    fun contentLike(content: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(content)) {
            return null
        }
        return QAlarmMessage.alarmMessage.content.like("%$content%")
    }

    fun memberAlarm(memberId: Long?): BooleanExpression? {
        if (CommonUtil.isEmpty(memberId)) {
            return null
        }

        val predicate = QAlarmMessage.alarmMessage.alarmTarget.isNotEmpty()
            .and(QAlarmMessage.alarmMessage.alarmTarget.any().targetType.eq(AlarmTargetType.ALL))
            .or(QAlarmMessage.alarmMessage.alarmTarget.any().targetMember.id.eq(memberId))

        return predicate
    }
}