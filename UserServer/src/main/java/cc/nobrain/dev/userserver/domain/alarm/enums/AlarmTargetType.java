package cc.nobrain.dev.userserver.domain.alarm.enums;

import lombok.Getter;

@Getter
public enum AlarmTargetType {
    All("전체"),
    MEMBER("특정 회원"),
    GROUP("특정 그룹");

    private String value;

    AlarmTargetType(String value) {
        this.value = value;
    }
}
