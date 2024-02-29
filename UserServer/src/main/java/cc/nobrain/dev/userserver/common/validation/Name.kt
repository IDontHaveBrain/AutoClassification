package cc.nobrain.dev.userserver.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Size;

import java.lang.annotation.*;
import kotlin.reflect.KClass

@Size(min = 2)
@ReportAsSingleViolation
@MustBeDocumented
@Constraint(validatedBy = [])
@Target(AnnotationTarget.FIELD, AnnotationTarget.ANNOTATION_CLASS, AnnotationTarget.VALUE_PARAMETER, AnnotationTarget.LOCAL_VARIABLE)
@Retention(AnnotationRetention.RUNTIME)
annotation class Name(
        val message: String = "이름은 최소 2글자 이상이어야 합니다.",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)