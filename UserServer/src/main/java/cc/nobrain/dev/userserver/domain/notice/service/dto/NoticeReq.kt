package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import lombok.NoArgsConstructor

@JsonIgnoreProperties(ignoreUnknown = true)
data class NoticeReq(val search: Search?, val create: Create?) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Search(
        var title: String?,
        var createMember: String?
    )

    data class Create(
        @NotNull
        var title: String,

        @NotNull
        @Size(min = 1, max = 2000)
        var content: String,

        var sticky: Boolean? = false,
        var attachments: List<FileDto?>? = emptyList()
    )
}