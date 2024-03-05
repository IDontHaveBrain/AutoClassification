package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile

data class WorkspaceRes(
    val owner: Member,
    val files: MutableList<TrainFile>?
) : WorkspaceDto() {

    data class Owner(
        val owner: Member,
    )

    data class Files(
        val files: MutableList<TrainFile>?,
    )
}
