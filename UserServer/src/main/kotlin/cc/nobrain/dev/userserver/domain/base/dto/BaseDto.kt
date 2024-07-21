package cc.nobrain.dev.userserver.domain.base.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonFormat
import java.time.OffsetDateTime

abstract class BaseDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    var createMember: String? = null

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    var createDateTime: OffsetDateTime? = null

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    var updateMember: String? = null

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    var updateDateTime: OffsetDateTime? = null
}
