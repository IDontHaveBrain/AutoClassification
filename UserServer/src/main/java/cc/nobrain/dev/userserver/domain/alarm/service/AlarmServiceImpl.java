package cc.nobrain.dev.userserver.domain.alarm.service;

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm;
import cc.nobrain.dev.userserver.domain.alarm.repository.AlarmRepository;
import cc.nobrain.dev.userserver.domain.alarm.service.dto.AlarmDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
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
    public List<AlarmDto> getMemberAlarmList(Long memberId) {
        List<Alarm> alarmList = alarmRepository.getMemberAlarmList(memberId);
        return alarmList.stream().map(alarm -> modelMapper.map(alarm, AlarmDto.class)).toList();
    }
}
