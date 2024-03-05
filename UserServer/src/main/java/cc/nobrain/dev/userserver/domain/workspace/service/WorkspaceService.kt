package cc.nobrain.dev.userserver.domain.workspace.service

import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace

interface WorkspaceService {
    fun createWorkspace(workspace: Workspace): Workspace
    fun updateWorkspace(workspace: Workspace): Workspace
    fun deleteWorkspace(id: Long)

    fun getWorkspace(id: Long): Workspace
    fun getMyWorkspace(): List<Workspace>
    fun addMember(workspaceId: Long, memberId: Long)
    fun removeMember(workspaceId: Long, memberId: Long)
}