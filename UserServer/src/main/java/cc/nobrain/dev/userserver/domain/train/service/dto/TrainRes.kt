package cc.nobrain.dev.userserver.domain.train.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.FileDto

data class LabelAndIds (
    val label: String,
    val ids: List<Int>
)

data class TrainRes(
    val labels_and_ids: List<LabelAndIds>
)