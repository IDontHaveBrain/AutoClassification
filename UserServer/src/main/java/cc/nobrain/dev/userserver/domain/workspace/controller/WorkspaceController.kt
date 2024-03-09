package cc.nobrain.dev.userserver.domain.workspace.controller

import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.springframework.data.domain.Pageable
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/workspace")
class WorkspaceController(
    private val workspaceService: WorkspaceService
) {

    @GetMapping("/my")
    suspend fun getMyWorkspaces(pageable: Pageable?): List<WorkspaceRes.Owner> {
        return workspaceService.getMyWorkspace();
    }

    @PostMapping
    suspend fun createWorkspace(@RequestBody create: WorkspaceReq.Create) {
        workspaceService.createWorkspace(create);
    }

    @PutMapping("/{id}", consumes = ["multipart/form-data"])
    suspend fun updateWorkspace(@PathVariable id: Long, update: WorkspaceReq.Update,
                                @RequestPart files: Array<MultipartFile>) {
        workspaceService.updateWorkspace(id, update);
    }

    @DeleteMapping("/{id}")
    suspend fun deleteWorkspace(@PathVariable id: Long) {
        workspaceService.deleteWorkspace(id);
    }
}