package cc.nobrain.dev.userserver.domain.alarm.controller;

import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService;
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    public List<AlarmDto> getMemberAlarmList(Long memberId) {
        return alarmService.getMemberAlarmList(memberId);
    }

}
