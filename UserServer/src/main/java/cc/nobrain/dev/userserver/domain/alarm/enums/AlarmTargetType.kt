package cc.nobrain.dev.userserver.domain.alarm.enums

enum class AlarmTargetType(val value: String) {
    ALL("전체"),
    MEMBER("특정 회원"),
    GROUP("특정 그룹")
}