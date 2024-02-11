package cc.nobrain.dev.userserver.domain.alarm.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
public enum AlarmEventType {
    GENERAL("일반"),
    NOTICE("공지"),
    EMERGENCY("긴급"),
    SYSTEM("시스템"),
    ETC("기타");

    private String value;

    AlarmEventType(String value) {
        this.value = value;
    }
}
