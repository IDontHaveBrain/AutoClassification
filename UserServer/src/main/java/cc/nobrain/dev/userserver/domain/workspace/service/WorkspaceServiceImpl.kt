package cc.nobrain.dev.userserver.domain.workspace.service

import cc.nobrain.dev.userserver.common.component.FileComponent
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.modelmapper.ModelMapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
@Transactional(readOnly = true)
class WorkspaceServiceImpl(
    private val workspaceRepository: WorkspaceRepository,
    private val memberService: MemberService,
    private val modelMapper: ModelMapper,
    private val fileComponent: FileComponent
) : WorkspaceService {

    @Transactional
    override suspend fun createWorkspace(create: WorkspaceReq.Create, files: Array<MultipartFile>?): WorkspaceRes {
        val member = MemberUtil.getCurrentMember();

        val workspace = modelMapper.map(create, Workspace::class.java);

        workspace.owner = member;
        workspace.addMember(member);
        workspaceRepository.save(workspace);

        val success: List<Any> = if (!files.isNullOrEmpty()) {
            fileComponent.uploadFile(files, TrainFile::class.java, workspace);
        } else {
            emptyList()
        }

        return modelMapper.map(workspace, WorkspaceRes::class.java);
    }

    @Transactional
    override suspend fun updateWorkspace(id: Long, update: WorkspaceReq.Update, files: Array<MultipartFile>?): WorkspaceRes {
        val workspace = workspaceRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };

        modelMapper.map(update, workspace);
        val success: List<Any> = if (!files.isNullOrEmpty()) {
            fileComponent.uploadFile(files, TrainFile::class.java, workspace);
        } else {
            emptyList()
        }

        update.classes?.let { workspace.changeClasses(it) };
        workspace.members = update.members as MutableList<Member>;
        workspaceRepository.save(workspace);

        return modelMapper.map(workspace, WorkspaceRes::class.java);
    }

    @Transactional
    override suspend fun deleteWorkspace(id: Long) {
        workspaceRepository.deleteById(id);
    }

    override suspend fun getWorkspace(id: Long): WorkspaceRes {
        val workspace = workspaceRepository.findWorkspaceResById(id)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };

        return modelMapper.map(workspace, WorkspaceRes::class.java);
    }

    override suspend fun getMyWorkspace(pageable: Pageable?): Page<WorkspaceRes.Owner> {
        val member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) };

        val workspace = workspaceRepository.findByMembers_IdOrOwner_Id(member.id, member.id, pageable);

        return workspace.map { space -> modelMapper.map(space, WorkspaceRes.Owner::class.java) }
    }

    @Transactional
    override suspend fun addMember(workspaceId: Long, memberId: Long) {
        val workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val member = memberService.findMemberById(memberId)
            ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        workspace.addMember(member);
        workspaceRepository.save(workspace);
    }

    @Transactional
    override suspend fun removeMember(workspaceId: Long, memberId: Long) {
        val workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val member = memberService.findMemberById(memberId)
            ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        workspace.removeMember(member);
        workspaceRepository.save(workspace);
    }

    @Transactional
    override suspend fun invite(invite: WorkspaceReq.Invite) {
        val workspace = workspaceRepository.findById(invite.workspaceId)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val members = memberService.findMemberByEmails(invite.emails.toMutableList())
            ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        members.forEach { member -> workspace.addMember(member) }
        workspaceRepository.save(workspace);
    }
}