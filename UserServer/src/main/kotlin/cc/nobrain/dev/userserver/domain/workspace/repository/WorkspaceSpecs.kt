package cc.nobrain.dev.userserver.domain.workspace.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace_
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification

object WorkspaceSpecs {

    fun nameLike(name: String?): Specification<Workspace> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(name)) {
                null
            } else {
                builder.like(builder.lower(root.get(Workspace_.name)), "%${name?.lowercase()}%")
            }
        }
    }

    fun descriptionLike(description: String?): Specification<Workspace> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(description)) {
                null
            } else {
                builder.like(builder.lower(root.get(Workspace_.description)), "%${description?.lowercase()}%")
            }
        }
    }

    fun orderByUpdateTime(): Sort {
        return Sort.by(Sort.Direction.DESC, Workspace_.updateDateTime.name)
    }
}
