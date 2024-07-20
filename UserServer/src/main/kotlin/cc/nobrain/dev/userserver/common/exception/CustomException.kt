package cc.nobrain.dev.userserver.common.exception

open class CustomException : RuntimeException {
    val code: String
    val status: Int

    constructor(message: String, code: String, status: Int) : super(message) {
        this.code = code
        this.status = status
    }

    constructor(message: String) : super(message) {
        this.code = "X000"
        this.status = 500
    }

    constructor(errorInfo: ErrorInfo) : super(errorInfo.message) {
        this.code = errorInfo.code
        this.status = errorInfo.status
    }
}