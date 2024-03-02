package cc.nobrain.dev.userserver.common.exception

enum class ErrorInfo(val code: String, val message: String, val status: Int) {
    LOGIN_USER_NOT_FOUND("U001", "Login User not found", 404),
    INVALID_DATA("U002", "Invalid Data", 400);
}