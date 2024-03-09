package cc.nobrain.dev.userserver.domain.workspace.service

import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes

interface WorkspaceService {
    suspend fun createWorkspace(create: WorkspaceReq.Create): WorkspaceRes
    suspend fun updateWorkspace(id: Long, create: WorkspaceReq.Update): WorkspaceRes
    suspend fun deleteWorkspace(id: Long)

    suspend fun getWorkspace(id: Long): Workspace
    suspend fun getMyWorkspace(): List<WorkspaceRes.Owner>
    suspend fun addMember(workspaceId: Long, memberId: Long)
    suspend fun removeMember(workspaceId: Long, memberId: Long)
}