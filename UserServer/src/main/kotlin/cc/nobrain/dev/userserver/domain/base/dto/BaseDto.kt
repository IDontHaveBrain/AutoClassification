package cc.nobrain.dev.userserver.domain.base.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.OffsetDateTime

abstract class BaseDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    var createMember: String? = null

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    var createDateTime: OffsetDateTime? = null

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    var updateMember: String? = null

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    var updateDateTime: OffsetDateTime? = null
}
