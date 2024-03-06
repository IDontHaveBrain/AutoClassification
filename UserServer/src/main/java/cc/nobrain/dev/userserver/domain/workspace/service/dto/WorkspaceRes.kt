package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile

data class WorkspaceRes(
    val owner: MemberDto,
    val files: MutableList<FileDto>?
) : WorkspaceDto() {

    data class Owner(
        val owner: MemberDto,
    )

    data class Files(
        val files: MutableList<FileDto>?,
    )
}
