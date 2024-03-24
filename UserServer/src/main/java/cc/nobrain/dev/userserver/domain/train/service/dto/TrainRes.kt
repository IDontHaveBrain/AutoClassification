package cc.nobrain.dev.userserver.domain.train.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.train.dto.ClassfiyDto
import lombok.NoArgsConstructor

data class LabelAndIds (
    val label: String,
    val ids: List<Long>
)

data class TrainRes(
    val labels_and_ids: List<LabelAndIds>
)

data class ClassfiyRes(
    val testFiles: List<FileDto> = listOf()
): ClassfiyDto() {
}