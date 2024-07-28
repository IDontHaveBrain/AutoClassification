package cc.nobrain.dev.userserver.domain.sse.enums

enum class SseEventType {
    HEARTBEAT,
    ALARM,
    NOTICE,
    MESSAGE,
    WORKSPACE_UPDATE,
    USER_UPDATE,
}
