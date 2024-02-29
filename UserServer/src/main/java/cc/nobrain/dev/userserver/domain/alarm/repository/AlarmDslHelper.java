package cc.nobrain.dev.userserver.domain.alarm.repository;

import cc.nobrain.dev.userserver.common.utils.CommonUtil;
import cc.nobrain.dev.userserver.domain.alarm.entity.QAlarm;
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import com.querydsl.core.types.dsl.BooleanExpression;

public class AlarmDslHelper {
    public static BooleanExpression titleLike(String title) {
        if (CommonUtil.isEmpty(title)) {
            return null;
        }
        return QAlarm.alarm.title.like("%" + title + "%");
    }

    public static BooleanExpression contentLike(String content) {
        if (CommonUtil.isEmpty(content)) {
            return null;
        }
        return QAlarm.alarm.content.like("%" + content + "%");
    }

    public static BooleanExpression memberAlarm(Long memberId) {
        if (CommonUtil.isEmpty(memberId)) {
            return null;
        }

        BooleanExpression predicate = QAlarm.alarm.alarmTarget.isNotEmpty()
                .and(QAlarm.alarm.alarmTarget.any().targetType.eq(AlarmTargetType.ALL))
                .or(QAlarm.alarm.alarmTarget.any().targetMember.id.eq(memberId));

        return predicate;
    }
}
