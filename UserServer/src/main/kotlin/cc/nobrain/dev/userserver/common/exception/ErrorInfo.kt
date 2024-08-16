package cc.nobrain.dev.userserver.common.exception

enum class ErrorInfo(val code: String, val message: String, val status: Int) {
    LOGIN_USER_NOT_FOUND("U001", "Login User not found", 404),
    INVALID_DATA("U002", "Invalid Data", 400),
    FILE_NOT_FOUND("U003", "File not found", 404),
    WORKSPACE_NOT_FOUND("U004", "Workspace not found", 404),
    TARGET_NOT_FOUND("U005", "Target not found", 404),
    DUPLICATE_EMAIL("U006", "Duplicate Email", 400),
    INSUFFICIENT_LABELED_DATA("U007", "Insufficient labeled data", 400),
}
