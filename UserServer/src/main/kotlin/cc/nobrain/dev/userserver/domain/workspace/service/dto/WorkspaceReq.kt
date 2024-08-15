package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.springframework.web.multipart.MultipartFile

data class WorkspaceReq(
    val create: Create? = null,
) {

    @JsonIgnoreProperties
    data class Create(
        var name: String,
        var description: String?,
        var classes: List<String>?,
        var members: List<Member>?,
    )

    @JsonIgnoreProperties
    data class Update(
        var name: String,
        var description: String?,
        var classes: List<String>?,
        var members: List<Member>?,
    )

    data class Invite(
        var workspaceId: Long,
        var emails: List<String>
    )

    data class Search(
        var name: String?,
        var ownerEmail: String?
    )
}
