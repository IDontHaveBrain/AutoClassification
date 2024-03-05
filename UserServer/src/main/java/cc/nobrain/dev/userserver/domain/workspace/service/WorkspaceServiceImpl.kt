package cc.nobrain.dev.userserver.domain.workspace.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class WorkspaceServiceImpl(
    private val workspaceRepository: WorkspaceRepository,
    private val memberService: MemberService,
) : WorkspaceService {

    @Transactional
    override fun createWorkspace(workspace: Workspace): Workspace {
        TODO("Not yet implemented")
    }

    @Transactional
    override fun updateWorkspace(workspace: Workspace): Workspace {
        TODO("Not yet implemented")
    }

    @Transactional
    override fun deleteWorkspace(id: Long) {
        TODO("Not yet implemented")
    }

    override fun getWorkspace(id: Long): Workspace {
        return workspaceRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };
    }

    override fun getMyWorkspace(): List<Workspace> {
        val member = MemberUtil.getCurrentMember()
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };

        return workspaceRepository.findByMembers_Id(member.id);
    }

    @Transactional
    override fun addMember(workspaceId: Long, memberId: Long) {
        val workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val member = memberService.findMemberById(memberId)
            ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        workspace.addMember(member);
        workspaceRepository.save(workspace);
    }

    @Transactional
    override fun removeMember(workspaceId: Long, memberId: Long) {
        val workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val member = memberService.findMemberById(memberId)
            ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND);

        workspace.removeMember(member);
        workspaceRepository.save(workspace);
    }
}