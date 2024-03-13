package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto

data class WorkspaceRes(
    val owner: MemberDto? = null,
    val members: MutableList<MemberDto>? = null,
    val files: MutableList<FileDto>? = null,
) : WorkspaceDto() {

    data class Members(
        val members: MutableList<MemberDto>? = null,
    ): WorkspaceDto()

    data class Owner(
        val owner: MemberDto = MemberDto(),
    ): WorkspaceDto()

    data class Files(
        val files: MutableList<FileDto>? = null,
    ): WorkspaceDto()
}
