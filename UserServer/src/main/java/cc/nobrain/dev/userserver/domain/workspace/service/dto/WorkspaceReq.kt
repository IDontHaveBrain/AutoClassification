package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile

data class WorkspaceReq(
    val create: Create?,
) {

    data class Create(
        var name: String,
        var description: String?,
        var files: MutableList<FileDto>? = mutableListOf()
    )

    data class Update(
        var name: String,
        var description: String?,
        var files: MutableList<FileDto>?
    )
}
