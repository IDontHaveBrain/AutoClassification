package cc.nobrain.dev.userserver.domain.alarm.service;

import cc.nobrain.dev.userserver.domain.alarm.entity.*;
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.entity.Member_;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.Objects;

public class AlarmSpecs {
    public static Specification<Alarm> findAlarmByMemberId(Long memberId) {
        return (root, query, builder) -> {
            if (Objects.isNull(memberId)) {
                return null;
            }

            Fetch<Alarm, AlarmRead> readFetch = root.fetch(Alarm_.alarmRead, JoinType.LEFT);

            Join<Alarm, AlarmTarget> alarmTarget = root.join(Alarm_.alarmTarget, JoinType.LEFT);
            Join<AlarmTarget, Member> member = alarmTarget.join(AlarmTarget_.targetMember, JoinType.LEFT);

            Predicate memberTargetId = builder.equal(member.get(Member_.id), memberId);
            Predicate memberGroup = builder.equal(member.get(Member_.memberGroup), alarmTarget.get(AlarmTarget_.targetGroup));

            Predicate targetTypeAll = builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.ALL);
            Predicate targetTypeMember = builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.MEMBER);
            Predicate targetTypeGroup = builder.equal(alarmTarget.get(AlarmTarget_.targetType), AlarmTargetType.GROUP);

            Predicate memberCondition = builder.and(targetTypeMember, memberTargetId);
            Predicate groupCondition = builder.and(targetTypeGroup, memberGroup);

            return builder.or(targetTypeAll, memberCondition, groupCondition);
        };
    }
}
