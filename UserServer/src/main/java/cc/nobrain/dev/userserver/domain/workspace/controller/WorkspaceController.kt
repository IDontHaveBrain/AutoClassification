package cc.nobrain.dev.userserver.domain.workspace.controller

import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/workspace")
class WorkspaceController(
    private val workspaceService: WorkspaceService
) {

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