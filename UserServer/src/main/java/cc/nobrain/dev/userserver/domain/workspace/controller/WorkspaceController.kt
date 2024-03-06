package cc.nobrain.dev.userserver.domain.workspace.controller

import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.springframework.data.domain.Pageable
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/workspace")
class WorkspaceController(
    private val workspaceService: WorkspaceService
) {

    @GetMapping("/my")
    fun getMyWorkspaces(pageable: Pageable?): List<WorkspaceRes.Owner> {
        return workspaceService.getMyWorkspace();
    }

    @PostMapping
    fun createWorkspace(create: WorkspaceReq.Create) {
        workspaceService.createWorkspace(create);
    }

    @PutMapping("/{id}")
    fun updateWorkspace(@PathVariable id: Long, create: WorkspaceReq.Create) {
        workspaceService.updateWorkspace(id, create);
    }

    @DeleteMapping("/{id}")
    fun deleteWorkspace(@PathVariable id: Long) {
        workspaceService.deleteWorkspace(id);
    }
}