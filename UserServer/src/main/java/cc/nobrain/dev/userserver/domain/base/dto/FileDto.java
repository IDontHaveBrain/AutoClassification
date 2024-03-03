package cc.nobrain.dev.userserver.domain.base.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.base.entity.File}
 */
@Data
@Accessors(chain = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileDto extends BaseDto implements Serializable {
    private Long id;
    private String dtype;
    private String url;
    @NotNull
    private String fileName;
    private String originalFileName;
    @NotNull
    private Long size;
    private String mimeType;
}