package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmRepository
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.modelmapper.ModelMapper
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AlarmServiceImpl(
    private val alarmRepository: AlarmRepository,
    private val modelMapper: ModelMapper
) : AlarmService {

     override suspend fun getMyAlarmList(): List<AlarmDto> {
        val member: Member = MemberUtil.getCurrentMemberDto().orElseThrow {
            CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND)
        };
        val spec: Specification<Alarm> = AlarmSpecs.findAlarmByMemberId(member.id);
        val alarmList: List<Alarm> = alarmRepository.findAll(spec);
        return alarmList.map { alarm -> modelMapper.map(alarm, AlarmDto::class.java) }
    }

    override suspend fun getMemberAlarmList(memberId: Long): List<AlarmDto> {
        val alarmList: List<Alarm> = alarmRepository.getMemberAlarmList(memberId);
        return alarmList.map { alarm -> modelMapper.map(alarm, AlarmDto::class.java) }
    }
}