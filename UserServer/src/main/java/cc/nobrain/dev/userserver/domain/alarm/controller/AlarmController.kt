package cc.nobrain.dev.userserver.domain.alarm.controller

import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmMessageDto
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/alarm")
class AlarmController(
    private val alarmService: AlarmService
) {

    @GetMapping("/my")
    suspend fun getMyAlarmList(): List<AlarmMessageDto> {
        return alarmService.getMyAlarmList()
    }

    @GetMapping("/{memberId}")
    suspend fun getMemberAlarmList(@PathVariable memberId: Long): List<AlarmMessageDto> {
        return alarmService.getMemberAlarmList(memberId)
    }

    @PutMapping("/{alarmId}")
    suspend fun readAlarm(@PathVariable alarmId: Long) {
        alarmService.readAlarm(alarmId)
    }

    @PutMapping("/all")
    suspend fun readAllAlarm() {
        alarmService.readAllAlarm()
    }
}