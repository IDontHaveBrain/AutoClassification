package cc.nobrain.dev.userserver.domain.alarm.controller;

import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService;
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alarm")
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping("/my")
    public List<AlarmDto> getMyAlarmList() {
        return alarmService.getMyAlarmList();
    }

    @GetMapping("/{memberId}")
    public List<AlarmDto> getMemberAlarmList(@PathVariable Long memberId) {
        return alarmService.getMemberAlarmList(memberId);
    }

}
