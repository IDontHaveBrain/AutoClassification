package cc.nobrain.dev.userserver.domain.base.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
public abstract class BaseDto {

    @JsonProperty(
            access = JsonProperty.Access.READ_ONLY
    )
    private String createMember;

    @JsonProperty(
            access = JsonProperty.Access.READ_ONLY
    )
    private OffsetDateTime createDateTime;

    @JsonProperty(
            access = JsonProperty.Access.READ_ONLY
    )
    private String updateMember;

    @JsonProperty(
            access = JsonProperty.Access.READ_ONLY
    )
    private OffsetDateTime updateDateTime;
}
