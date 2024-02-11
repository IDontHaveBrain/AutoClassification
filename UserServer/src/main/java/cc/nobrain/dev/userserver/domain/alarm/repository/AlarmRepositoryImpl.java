package cc.nobrain.dev.userserver.domain.alarm.repository;

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm;
import cc.nobrain.dev.userserver.domain.alarm.entity.QAlarm;
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import cc.nobrain.dev.userserver.domain.member.entity.QMember;
import cc.nobrain.dev.userserver.domain.member.entity.QMemberGroup;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static cc.nobrain.dev.userserver.domain.alarm.entity.QAlarm.alarm;

@RequiredArgsConstructor
public class AlarmRepositoryImpl implements AlarmRepositoryCustom {

    private final JPAQueryFactory factory;

    @Override
    public List<Alarm> getMemberAlarmList(Long memberId) {
        return factory.selectFrom(alarm)
                .join(alarm.alarmTarget.any().targetMember, QMember.member)
                .where(AlarmDslHelper.memberAlarm(memberId)
                        .or(alarm.alarmTarget.any().targetGroup.id.eq(QMemberGroup.memberGroup.id))
                ).fetch();
    }
}
