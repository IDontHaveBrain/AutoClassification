package cc.nobrain.dev.userserver.domain.alarm.service.dto;

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.OffsetDateTime;

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.alarm.entity.AlarmRead}
 */
@Data
@Accessors(chain = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlarmReadDto extends BaseDto implements Serializable {
    private Long id;
    private boolean readYn;
    private boolean deleteYn;
    private OffsetDateTime readAt;
    private OffsetDateTime deleteAt;
}