package cc.nobrain.dev.userserver.domain.alarm.service

import cc.nobrain.dev.userserver.common.component.NotificationComponent
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmRead
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTarget
import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTargetMember
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmMessageMessageRepository
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmReadRepository
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmTargetRepository
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmMessageDto
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmRes
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType
import cc.nobrain.dev.userserver.domain.sse.service.dto.SseMessageDto
import com.fasterxml.jackson.databind.ObjectMapper
import org.modelmapper.ModelMapper
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

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

     override suspend fun getMyAlarmList(): List<AlarmRes> {
        val member: Member = MemberUtil.instance.getCurrentMember()
        val spec: Specification<AlarmMessage> = AlarmSpecs.findAlarmByMemberId(member.id)
        val alarmMessageList: List<AlarmMessage> = alarmMessageRepository.findAll(spec)
        return alarmMessageList.map { alarm -> modelMapper.map(alarm, AlarmRes::class.java) }
    }

    override suspend fun getMemberAlarmList(memberId: Long): List<AlarmMessageDto> {
        val alarmMessageList: List<AlarmMessage> = alarmMessageRepository.getMemberAlarmList(memberId);
        return alarmMessageList.map { alarm -> modelMapper.map(alarm, AlarmMessageDto::class.java) }
    }

    @Transactional
    override suspend fun readAlarm(alarmId: Long) {
        val member: Member = MemberUtil.instance.getCurrentMember()

        val alarmMessage: AlarmMessage = alarmMessageRepository.findById(alarmId).orElseThrow {
            CustomException(ErrorInfo.TARGET_NOT_FOUND)
        }

        val alarmRead = AlarmRead(
            reader = member,
            alarmMessage = alarmMessage
        )
        alarmRead.read();

        alarmReadRepository.save(alarmRead)
    }

    @Transactional
    override suspend fun readAllAlarm() {
        val member: Member = MemberUtil.instance.getCurrentMember()

        val spec: Specification<AlarmMessage> = AlarmSpecs.findAlarmByMemberId(member.id)
        val alarmMessageList: List<AlarmMessage> = alarmMessageRepository.findAll(spec)

        val alarmReads = alarmMessageList.map { alarmMessage ->
            val alarmRead = AlarmRead(
                reader = member,
                alarmMessage = alarmMessage
            )
            alarmRead.read()
            alarmRead
        }

        alarmReadRepository.saveAll(alarmReads)
    }

    @Transactional
    override suspend fun sendAlarmToMember(memberId: Long, title: String, content: String, url: String?) {
        val member = memberService.findMemberById(memberId) ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        var newAlarmMessage = createAlarmMessage(title, content, AlarmEventType.GENERAL, url);
        newAlarmMessage = alarmMessageRepository.save(newAlarmMessage);

        var alarmTarget = AlarmTargetMember().apply {
            this.targetType = AlarmTargetType.MEMBER;
            this.targetMember = member;
            this.alarmMessage = newAlarmMessage;
        }

        alarmTargetRepository.save(alarmTarget);
        val message = SseMessageDto(
            type = SseEventType.ALARM,
            message = newAlarmMessage
        )
        notificationComponent.sendMessage(member.id.toString(), message);
    }

    private fun createAlarmMessage(title: String, content: String, eventType: AlarmEventType, url: String? = null): AlarmMessage {
        var alarmMessage = AlarmMessage(
            title = title,
            content = content,
            eventType = eventType,
            link = url
        )

        return alarmMessage;
    }
}
