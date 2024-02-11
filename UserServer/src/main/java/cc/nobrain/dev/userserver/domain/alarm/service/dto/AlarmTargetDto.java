package cc.nobrain.dev.userserver.domain.alarm.service.dto;

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import cc.nobrain.dev.userserver.domain.base.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTarget}
 */
@Data
@Accessors(chain = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlarmTargetDto extends BaseDto implements Serializable {
    private Long id;
    private AlarmTargetType targetType;
}