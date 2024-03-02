package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.alarm.entity.QAlarm
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import com.querydsl.core.types.dsl.BooleanExpression

object AlarmDslHelper {

    fun titleLike(title: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(title)) {
            return null
        }
        return QAlarm.alarm.title.like("%$title%")
    }

    fun contentLike(content: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(content)) {
            return null
        }
        return QAlarm.alarm.content.like("%$content%")
    }

    fun memberAlarm(memberId: Long?): BooleanExpression? {
        if (CommonUtil.isEmpty(memberId)) {
            return null
        }

        val predicate = QAlarm.alarm.alarmTarget.isNotEmpty()
            .and(QAlarm.alarm.alarmTarget.any().targetType.eq(AlarmTargetType.ALL))
            .or(QAlarm.alarm.alarmTarget.any().targetMember.id.eq(memberId))

        return predicate
    }
}