package cc.nobrain.dev.userserver.domain.workspace.controller

import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/workspace")
class WorkspaceController(
    private val workspaceService: WorkspaceService
) {

    @GetMapping("/my")
    suspend fun getMyWorkspaces(pageable: Pageable?): Page<WorkspaceRes.Owner> {
        return workspaceService.getMyWorkspace(pageable);
    }

    @GetMapping("/{id}")
    suspend fun getWorkspace(@PathVariable id: Long): WorkspaceRes {
        return workspaceService.getWorkspace(id);
    }

    @PostMapping(consumes = ["application/json", MediaType.MULTIPART_FORM_DATA_VALUE])
    suspend fun createWorkspace(@RequestPart("update") update: WorkspaceReq.Create,
                                @RequestPart("files") files: Array<MultipartFile>?) {
        workspaceService.createWorkspace(update, files);
    }

    @PutMapping("/{id}", consumes = ["application/json", MediaType.MULTIPART_FORM_DATA_VALUE])
    suspend fun updateWorkspace(@PathVariable id: Long,
                                @RequestPart("update") update: WorkspaceReq.Update,
                                @RequestPart("files") files: Array<MultipartFile>?) {
        workspaceService.updateWorkspace(id, update, files);
    }

    @DeleteMapping("/{id}")
    suspend fun deleteWorkspace(@PathVariable id: Long) {
        workspaceService.deleteWorkspace(id);
    }

    @PostMapping("/invite")
    suspend fun invite(@RequestBody invite: WorkspaceReq.Invite) {
        workspaceService.invite(invite);
    }
}