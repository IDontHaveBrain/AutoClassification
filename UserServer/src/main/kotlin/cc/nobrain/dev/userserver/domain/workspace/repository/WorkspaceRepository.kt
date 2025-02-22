package cc.nobrain.dev.userserver.domain.workspace.repository;

import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.util.Optional

interface WorkspaceRepository : JpaRepository<Workspace, Long>, JpaSpecificationExecutor<Workspace> {
    fun findByMembers_Id(id: Long): List<Workspace>

    fun findByMembers_IdOrOwner_Id(id: Long, id1: Long): Set<Workspace>

    fun findByMembers_IdOrOwner_Id(id: Long, id1: Long, pageable: Pageable?): Page<Workspace>

    fun findWorkspaceResById(id: Long): Optional<Workspace>
}
