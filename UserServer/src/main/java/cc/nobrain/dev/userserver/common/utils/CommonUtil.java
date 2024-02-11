package cc.nobrain.dev.userserver.common.utils;

import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

public class CommonUtil {
    public static boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    public static boolean isEmpty(String value) {
        return value == null || value.isEmpty() || value.trim().isEmpty()
                || value.equals("null") || value.equals("undefined") || value.equals("nan")
                || value.equals("NULL") || value.equals("UNDEFINED") || value.equals("NAN")
                || value.equals("Null") || value.equals("Undefined") || value.equals("Nan")
                || value.equals("NaN")  || value.trim().equals("0");
    }

    public static boolean isEmpty(Integer value) {
        return value == null || value == 0;
    }

    public static boolean isEmpty(Long value) {
        return value == null || value == 0;
    }

    public static boolean isEmpty(List value) {
        return value == null || value.size() == 0;
    }

    public static boolean isStringExclude(String fieldName, String[] excludedFields) {
        return Arrays.asList(excludedFields).contains(fieldName);
    }

    public static boolean hasNonNullField(Object dto) {
        final Field[] declaredFields = dto.getClass().getDeclaredFields();

        for (Field field : declaredFields) {
            ReflectionUtils.makeAccessible(field);
            try {
                Object value = field.get(dto);
                if (value != null) {
                    return true;
                }
            } catch (IllegalAccessException e) {
                //e.printStackTrace();
                return false;
            }
        }

        return false;
    }

    public static boolean allNullField(Object dto) {
        return !hasNonNullField(dto);
    }

    public static boolean hasNonEmptyField(Object dto) {
        final Field[] declaredFields = dto.getClass().getDeclaredFields();

        for (Field field : declaredFields) {
            ReflectionUtils.makeAccessible(field);

            try {
                Object value = field.get(dto);
                if (value != null) {
                    Method targetMethod = null;

                    for (Method method : CommonUtil.class.getDeclaredMethods()) {
                        if ("isEmpty".equals(method.getName()) &&
                                method.getParameterTypes().length == 1 &&
                                method.getParameterTypes()[0].isInstance(value)) {
                            targetMethod = method;
                            break;
                        }
                    }

                    if (targetMethod == null) {
                        return true;
                    } else {
                        Boolean isEmptyResult = (Boolean) targetMethod.invoke(null, value);
                        if (!isEmptyResult) {
                            return true;
                        }
                    }
                }
            } catch (Exception e) {
                //e.printStackTrace();
                return false;
            }
        }

        return false;
    }

    public static boolean allEmptyField(Object dto) {
        return !hasNonEmptyField(dto);
    }
}
