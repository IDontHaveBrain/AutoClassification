package cc.nobrain.dev.userserver.domain.alarm.enums

enum class AlarmEventType(val value: String) {
    GENERAL("일반"),
    NOTICE("공지"),
    EMERGENCY("긴급"),
    SYSTEM("시스템"),
    ETC("기타")
}