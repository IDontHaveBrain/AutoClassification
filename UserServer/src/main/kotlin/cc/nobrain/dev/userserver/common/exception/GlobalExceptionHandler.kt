package cc.nobrain.dev.userserver.common.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.bind.support.WebExchangeBindException

/**
 * 전역 예외 처리기
 * API 요청 중 발생하는 예외들을 처리하고 적절한 응답을 반환합니다.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    /**
     * 유효성 검사 실패 예외 처리 (일반적인 @Valid 검증)
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, Any>> {
        val errors = ex.bindingResult.allErrors.map { error ->
            val fieldName = (error as? FieldError)?.field ?: "unknown"
            val errorMessage = error.defaultMessage ?: "Validation failed"
            fieldName to errorMessage
        }.toMap()

        val response = mapOf(
            "status" to HttpStatus.BAD_REQUEST.value(),
            "error" to "Validation Error",
            "message" to "입력값 검증에 실패했습니다.",
            "errors" to errors
        )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    /**
     * 리액티브 유효성 검사 실패 예외 처리 (suspend 함수에서의 @Valid 검증)
     */
    @ExceptionHandler(WebExchangeBindException::class)
    fun handleWebExchangeBindException(ex: WebExchangeBindException): ResponseEntity<Map<String, Any>> {
        val errors = ex.bindingResult.allErrors.map { error ->
            val fieldName = (error as? FieldError)?.field ?: "unknown"
            val errorMessage = error.defaultMessage ?: "Validation failed"
            fieldName to errorMessage
        }.toMap()

        val response = mapOf(
            "status" to HttpStatus.BAD_REQUEST.value(),
            "error" to "Validation Error",
            "message" to "입력값 검증에 실패했습니다.",
            "errors" to errors
        )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    /**
     * CustomException 처리
     */
    @ExceptionHandler(CustomException::class)
    fun handleCustomException(ex: CustomException): ResponseEntity<Map<String, Any>> {
        val response = mapOf(
            "status" to ex.status,
            "error" to ex.code,
            "message" to (ex.message ?: "An error occurred")
        )

        return ResponseEntity.status(ex.status).body(response)
    }

    /**
     * 일반 예외 처리
     */
    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<Map<String, Any>> {
        val response = mapOf(
            "status" to HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "error" to "Internal Server Error",
            "message" to "서버 내부 오류가 발생했습니다."
        )

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}