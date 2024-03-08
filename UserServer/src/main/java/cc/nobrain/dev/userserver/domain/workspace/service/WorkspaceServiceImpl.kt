package cc.nobrain.dev.userserver.domain.workspace.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.modelmapper.ModelMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class WorkspaceServiceImpl(
    private val workspaceRepository: WorkspaceRepository,
    private val memberService: MemberService,
    private val modelMapper: ModelMapper,
) : WorkspaceService {

    @Transactional
    override suspend fun createWorkspace(create: WorkspaceReq.Create): WorkspaceRes {
        val member = MemberUtil.getCurrentMember();

        val workspace = modelMapper.map(create, Workspace::class.java);

        workspace.owner = member;
        workspace.addMember(member);
        workspaceRepository.save(workspace);

        return modelMapper.map(workspace, WorkspaceRes::class.java);
    }

    @Transactional
    override suspend fun updateWorkspace(id: Long, create: WorkspaceReq.Create): WorkspaceRes {
        val workspace = workspaceRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };

        modelMapper.map(create, workspace);
        workspaceRepository.save(workspace);

        return modelMapper.map(workspace, WorkspaceRes::class.java);
    }

    @Transactional
    override suspend fun deleteWorkspace(id: Long) {
        workspaceRepository.deleteById(id);
    }

    override suspend fun getWorkspace(id: Long): Workspace {
        return workspaceRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };
    }

    override suspend fun getMyWorkspace(): List<WorkspaceRes.Owner> {
        val member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) };

        val workspace = workspaceRepository.findByMembers_IdOrOwner_Id(member.id, member.id);

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
}