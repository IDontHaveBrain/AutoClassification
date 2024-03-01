package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import java.io.Serializable

data class NoticeRes(
    var attachments: List<FileDto> = emptyList()
) : NoticeDto(
    id = 0,
    title = "",
    content = "",
    sticky = false
), Serializable