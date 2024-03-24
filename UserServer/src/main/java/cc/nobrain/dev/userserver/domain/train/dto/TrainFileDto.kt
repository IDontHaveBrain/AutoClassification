package cc.nobrain.dev.userserver.domain.train.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import java.io.Serializable

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.train.entity.Classfiy}
 */
open class TrainFileDto(
    label: String? = "none",
) : FileDto(), Serializable