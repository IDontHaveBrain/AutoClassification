package cc.nobrain.dev.userserver.domain.workspace.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import jakarta.validation.constraints.NotNull
import java.io.Serializable

/**
 * DTO for {@link cc.nobrain.dev.userserver.domain.workspace.entity.Workspace}
 */
open class WorkspaceDto(
    var id: Long? = null,
    var name: String? = null,
    var description: String? = null,
    var classes: List<String> = emptyList<String>(),
) : BaseDto(), Serializable