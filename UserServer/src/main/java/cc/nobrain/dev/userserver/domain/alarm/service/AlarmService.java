package cc.nobrain.dev.userserver.domain.alarm.service;

import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto;

import java.util.List;

public interface AlarmService {
    List<AlarmDto> getMemberAlarmList(Long memberId);

    List<AlarmDto> getMyAlarmList();
}
