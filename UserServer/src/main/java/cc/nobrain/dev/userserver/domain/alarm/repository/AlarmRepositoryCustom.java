package cc.nobrain.dev.userserver.domain.alarm.repository;

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm;

import java.util.List;

public interface AlarmRepositoryCustom {

    List<Alarm> getMemberAlarmList(Long memberId);
}
