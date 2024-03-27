package cc.nobrain.dev.userserver.domain.train.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.train.dto.ClassfiyDto
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceDto
import lombok.NoArgsConstructor

data class LabelAndIds (
    val label: String,
    val ids: List<Long>
)

data class WorkspaceClassfiy(
    val requesterId: Long,
    val workspaceId: Long,
    val labelsAndIds: List<LabelAndIds>
)

data class ClassfiyRes(
    val testFiles: List<FileDto> = listOf()
): ClassfiyDto() {
}