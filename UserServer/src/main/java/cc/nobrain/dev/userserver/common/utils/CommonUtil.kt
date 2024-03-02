package cc.nobrain.dev.userserver.common.utils

import org.springframework.util.ReflectionUtils
import java.lang.reflect.Method
import java.time.DayOfWeek
import java.time.LocalDate

object CommonUtil {
    @JvmStatic
    fun isWeekend(date: LocalDate): Boolean {
        val dayOfWeek = date.dayOfWeek
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY
    }

    @JvmStatic
    fun isEmpty(value: String?): Boolean {
        return value == null || value.isEmpty() || value.trim().isEmpty()
                || value.equals("null", ignoreCase = true) || value.equals("undefined", ignoreCase = true) || value.equals("nan", ignoreCase = true)
                || value.trim().equals("0")
    }

    @JvmStatic
    fun isEmpty(value: Int?): Boolean {
        return value == null || value == 0
    }

    @JvmStatic
    fun isEmpty(value: Long?): Boolean {
        return value == null || value == 0L
    }

    @JvmStatic
    fun isEmpty(value: List<*>?): Boolean {
        return value == null || value.isEmpty()
    }

    @JvmStatic
    fun isStringExclude(fieldName: String, excludedFields: Array<String>): Boolean {
        return excludedFields.contains(fieldName)
    }

    @JvmStatic
    fun hasNonNullField(dto: Any): Boolean {
        val declaredFields = dto.javaClass.declaredFields

        for (field in declaredFields) {
            ReflectionUtils.makeAccessible(field)
            try {
                val value = field.get(dto)
                if (value != null) {
                    return true
                }
            } catch (e: IllegalAccessException) {
                return false
            }
        }

        return false
    }

    @JvmStatic
    fun allNullField(dto: Any): Boolean {
        return !hasNonNullField(dto)
    }

    @JvmStatic
    fun hasNonEmptyField(dto: Any): Boolean {
        val declaredFields = dto.javaClass.declaredFields

        for (field in declaredFields) {
            ReflectionUtils.makeAccessible(field)

            try {
                val value = field.get(dto)
                if (value != null) {
                    var targetMethod: Method? = null

                    for (method in CommonUtil::class.java.declaredMethods) {
                        if ("isEmpty" == method.name &&
                                method.parameterTypes.size == 1 &&
                                method.parameterTypes[0].isInstance(value)) {
                            targetMethod = method
                            break
                        }
                    }

                    if (targetMethod == null) {
                        return true
                    } else {
                        val isEmptyResult = targetMethod.invoke(null, value) as Boolean
                        if (!isEmptyResult) {
                            return true
                        }
                    }
                }
            } catch (e: Exception) {
                return false
            }
        }

        return false
    }

    @JvmStatic
    fun allEmptyField(dto: Any): Boolean {
        return !hasNonEmptyField(dto)
    }
}