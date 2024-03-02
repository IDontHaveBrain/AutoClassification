package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import lombok.NoArgsConstructor

@JsonIgnoreProperties(ignoreUnknown = true)
data class NoticeReq(val search: Search?, val create: Create?) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Search(
            var title: String?,
            var createMember: String?
    )

    data class Create(
            var title: String,
            var content: String,
            var sticky: Boolean?,
            var attachments: List<FileDto?>?
    )
}