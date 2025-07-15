package cc.nobrain.dev.userserver.domain.workspace.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.Member_
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace_
import jakarta.persistence.criteria.Fetch
import jakarta.persistence.criteria.Join
import jakarta.persistence.criteria.JoinType
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

    fun ownerEmailLike(ownerEmail: String?): Specification<Workspace> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(ownerEmail)) {
                null
            } else {
                query?.distinct(true)
                val owner = root.join(Workspace_.owner, JoinType.LEFT)
                builder.like(builder.lower(owner.get(Member_.email)), "%${ownerEmail?.lowercase()}%")
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

    fun ownerIdEq(ownerId: Long): Specification<Workspace> {
        return Specification { root, _, builder ->
            if (CommonUtil.isEmpty(ownerId)) {
                null
            } else {
                builder.equal(root.get(Workspace_.owner).get(Member_.id), ownerId)
            }
        }
    }

    fun membersIdIn(memberIds: Collection<Long>): Specification<Workspace> {
        return Specification { root, query, builder ->
            if (memberIds.isEmpty()) {
                null
            } else {
                query?.distinct(true)
                val members: Join<Workspace, Member> = root.join(Workspace_.members, JoinType.LEFT)
                members.get(Member_.id).`in`(memberIds)
            }
        }
    }
}
