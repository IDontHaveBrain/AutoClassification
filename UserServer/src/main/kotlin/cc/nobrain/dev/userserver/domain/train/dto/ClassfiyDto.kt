package cc.nobrain.dev.userserver.domain.train.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import java.io.Serializable

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.train.entity.Classfiy}
 */
open class ClassfiyDto(
    val id: Long? = null,
    val classes: MutableList<String> = mutableListOf(),
    val resultJson: String = ""
) : BaseDto(), Serializable