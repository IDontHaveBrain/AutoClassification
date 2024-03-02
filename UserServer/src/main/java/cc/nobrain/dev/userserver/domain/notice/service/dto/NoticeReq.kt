package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class NoticeReq(
        val search: Search,
        val create: Create
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Search(
            var title: String,
            var createMember: String
    )

    data class Create(
            val title: String,
            val content: String,
            val sticky: Boolean,
            val attachments: List<FileDto>
    )
}