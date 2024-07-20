package cc.nobrain.dev.userserver.domain.base.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.validation.constraints.NotNull
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
open class FileDto(
    var id: Long? = null,
    var dtype: String? = null,
    var url: String? = null,
    @field:NotNull
    var fileName: String? = null,
    var originalFileName: String? = null,
    @field:NotNull
    var size: Long? = null,
    var contentType: String? = null
) : BaseDto(), Serializable
