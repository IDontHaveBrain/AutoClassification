package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import org.springframework.web.multipart.MultipartFile

data class WorkspaceReq(
    val create: Create? = null,
) {

    data class Create(
        var name: String,
        var description: String?,
        var classes: List<String>?,
//        var files: MutableList<FileDto>? = mutableListOf()
    )

    data class Update(
        var name: String,
        var description: String?,
        var classes: List<String>?,
//        var files: Array<MultipartFile>?
    )
}
