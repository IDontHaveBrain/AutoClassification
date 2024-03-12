package cc.nobrain.dev.userserver.domain.alarm.controller

import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/alarm")
class AlarmController(
    private val alarmService: AlarmService
) {

    @GetMapping("/my")
    suspend fun getMyAlarmList(): List<AlarmDto> {
        return alarmService.getMyAlarmList()
    }

    @GetMapping("/{memberId}")
    suspend fun getMemberAlarmList(@PathVariable memberId: Long): List<AlarmDto> {
        return alarmService.getMemberAlarmList(memberId)
    }
}