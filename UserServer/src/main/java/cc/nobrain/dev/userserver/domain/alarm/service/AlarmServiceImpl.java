package cc.nobrain.dev.userserver.domain.alarm.service;

import cc.nobrain.dev.userserver.common.exception.CustomException;
import cc.nobrain.dev.userserver.common.utils.GlobalUtil;
import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm;
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmRepository;
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AlarmServiceImpl implements AlarmService {

    private final AlarmRepository alarmRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<AlarmDto> getMyAlarmList() {
        Member member = GlobalUtil.getCurrentMember().orElseThrow(() ->
                new CustomException("로그인 사용자를 찾을 수 없습니다."));
        Specification<Alarm> spec = AlarmSpecs.findAlarmByMemberId(member.getId());
        List<Alarm> alarmList = alarmRepository.findAll(spec);
        return alarmList.stream().map(alarm -> modelMapper.map(alarm, AlarmDto.class)).toList();
    }

    @Override
    public List<AlarmDto> getMemberAlarmList(Long memberId) {
        List<Alarm> alarmList = alarmRepository.getMemberAlarmList(memberId);
        return alarmList.stream().map(alarm -> modelMapper.map(alarm, AlarmDto.class)).toList();
    }
}
