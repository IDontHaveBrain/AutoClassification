package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.validation.constraints.NotNull
import java.io.Serializable

/**
 *
 */

open class NoticeDto(
    var id: Long,
    @NotNull var title: String,
    var content: String?,
    var sticky: Boolean?
) : BaseDto(), Serializable