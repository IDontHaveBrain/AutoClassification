package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import jakarta.validation.constraints.NotNull
import java.io.Serializable

open class NoticeDto(
    var id: Long = 0,
    @NotNull var title: String = "",
    var content: String? = null,
    var sticky: Boolean? = null
) : BaseDto(), Serializable
