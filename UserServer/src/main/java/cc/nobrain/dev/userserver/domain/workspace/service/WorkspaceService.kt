package cc.nobrain.dev.userserver.domain.workspace.service

import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes

interface WorkspaceService {
    fun createWorkspace(create: WorkspaceReq.Create): WorkspaceRes
    fun updateWorkspace(id: Long, create: WorkspaceReq.Create): WorkspaceRes
    fun deleteWorkspace(id: Long)

    fun getWorkspace(id: Long): Workspace
    fun getMyWorkspace(): List<WorkspaceRes.Owner>
    fun addMember(workspaceId: Long, memberId: Long)
    fun removeMember(workspaceId: Long, memberId: Long)
}