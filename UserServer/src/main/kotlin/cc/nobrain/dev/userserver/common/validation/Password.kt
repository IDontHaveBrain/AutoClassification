package cc.nobrain.dev.userserver.common.validation

import jakarta.validation.Constraint
import jakarta.validation.Payload
import jakarta.validation.ReportAsSingleViolation
import jakarta.validation.constraints.Pattern
import kotlin.reflect.KClass

@Pattern(regexp="^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$")
@ReportAsSingleViolation
@MustBeDocumented
@Constraint(validatedBy = [])
@Target(AnnotationTarget.FIELD, AnnotationTarget.ANNOTATION_CLASS, AnnotationTarget.VALUE_PARAMETER, AnnotationTarget.LOCAL_VARIABLE)
@Retention(AnnotationRetention.RUNTIME)
annotation class Password(
        val message: String = "비밀번호는 최소 6자이며, 최소 하나의 숫자와 하나의 특수 문자를 포함해야 합니다.",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)