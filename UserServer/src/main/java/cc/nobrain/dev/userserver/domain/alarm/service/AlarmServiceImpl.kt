package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.common.component.NotificationComponent
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTarget
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTargetMember
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmMessageMessageRepository
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmReadRepository
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmTargetRepository
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import com.fasterxml.jackson.databind.ObjectMapper
import org.modelmapper.ModelMapper
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AlarmServiceImpl(
    private val alarmMessageRepository: AlarmMessageMessageRepository,
    private val alarmReadRepository: AlarmReadRepository,
    private val alarmTargetRepository: AlarmTargetRepository<AlarmTarget>,
    private val memberService: MemberService,
    private val notificationComponent: NotificationComponent,
    private val objectMapper: ObjectMapper,
    private val modelMapper: ModelMapper
) : AlarmService {

     override suspend fun getMyAlarmList(): List<AlarmDto> {
        val member: Member = MemberUtil.getCurrentMemberDto().orElseThrow {
            CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND)
        };
        val spec: Specification<AlarmMessage> = AlarmSpecs.findAlarmByMemberId(member.id);
        val alarmMessageList: List<AlarmMessage> = alarmMessageRepository.findAll(spec);
        return alarmMessageList.map { alarm -> modelMapper.map(alarm, AlarmDto::class.java) }
    }

    override suspend fun getMemberAlarmList(memberId: Long): List<AlarmDto> {
        val alarmMessageList: List<AlarmMessage> = alarmMessageRepository.getMemberAlarmList(memberId);
        return alarmMessageList.map { alarm -> modelMapper.map(alarm, AlarmDto::class.java) }
    }

    @Transactional
    override suspend fun sendAlarm(memberId: Long, title: String, content: String) {
        val member = memberService.findMemberById(memberId) ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        var alarmMessage = createAlarmMessage(title, content, AlarmEventType.GENERAL);
        alarmMessage = alarmMessageRepository.save(alarmMessage);

        var alarmTarget = AlarmTargetMember().apply {
            targetType = AlarmTargetType.MEMBER;
            targetMember = member;
            alarmMessage = alarmMessage;
        }

        alarmTargetRepository.save(alarmTarget);
        notificationComponent.sendMessage(member.id.toString(), objectMapper.writeValueAsString(alarmMessage));
    }

    private fun createAlarmMessage(title: String, content: String, eventType: AlarmEventType): AlarmMessage {
        var alarmMessage = AlarmMessage.builder()
            .title(title)
            .content(content)
            .eventType(eventType)
            .build()

        return alarmMessage;
    }

//    @Transactional
//    suspend fun send
}