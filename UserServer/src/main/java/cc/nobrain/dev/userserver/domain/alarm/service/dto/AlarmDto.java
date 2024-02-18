package cc.nobrain.dev.userserver.domain.alarm.service.dto;

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType;
import cc.nobrain.dev.userserver.domain.base.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.alarm.entity.Alarm}
 */

@Data
@Accessors(chain = true)
public class AlarmDto extends BaseDto {
    private Long id;
    private String title;
    private String content;
    private AlarmEventType eventType;
}