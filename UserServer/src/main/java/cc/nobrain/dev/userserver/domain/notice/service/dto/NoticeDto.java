package cc.nobrain.dev.userserver.domain.notice.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.notice.entity.Notice}
 */
@Data
@Accessors(chain = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class NoticeDto implements Serializable {
    private Long id;
    @NotNull
    private String title;
    private String content;
    private Boolean sticky;
}