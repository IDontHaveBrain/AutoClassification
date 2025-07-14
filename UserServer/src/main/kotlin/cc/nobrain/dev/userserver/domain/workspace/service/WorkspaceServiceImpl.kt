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
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceSpecs
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceReq
import cc.nobrain.dev.userserver.domain.workspace.service.dto.WorkspaceRes
import org.modelmapper.ModelMapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
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

    override suspend fun searchWorkspaces(search: WorkspaceReq.Search, pageable: Pageable?): Page<WorkspaceRes> {
        val spec = Specification.where(WorkspaceSpecs.nameLike(search.name))
            .and(WorkspaceSpecs.ownerEmailLike(search.ownerEmail))

        val workspaces = workspaceRepository.findAll(spec, pageable ?: Pageable.unpaged())
        return workspaces.map { workspace -> modelMapper.map(workspace, WorkspaceRes::class.java) }
    }

    @Transactional
    override suspend fun createWorkspace(create: WorkspaceReq.Create, files: Array<MultipartFile>?): WorkspaceRes {
        val member = MemberUtil.instance.getCurrentMember();

        val workspace = modelMapper.map(create, Workspace::class.java);

        workspace.owner = member;
        workspace.addMember(member);
        
        // Add additional members if provided
        create.memberIds?.forEach { memberId ->
            val memberToAdd = memberService.findMemberById(memberId)
                ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND)
            
            // Don't add owner again
            if (memberToAdd.id != member.id) {
                workspace.addMember(memberToAdd)
            }
        }
        
        workspaceRepository.save(workspace);

        if (!files.isNullOrEmpty()) {
            fileComponent.uploadFile(files, TrainFile::class.java, workspace)
        }

        return modelMapper.map(workspace, WorkspaceRes::class.java);
    }

    @Transactional
    override suspend fun updateWorkspace(id: Long, update: WorkspaceReq.Update, files: Array<MultipartFile>?): WorkspaceRes {
        val workspace = workspaceRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) };

        modelMapper.map(update, workspace);
        if (!files.isNullOrEmpty()) {
            fileComponent.uploadFile(files, TrainFile::class.java, workspace);
        }

        update.classes?.let { workspace.changeClasses(it) };
        
        // Handle members update properly using member IDs
        update.memberIds?.let { memberIds ->
            // Clear current members (except owner)
            val currentMembers = workspace.members.toList()
            currentMembers.forEach { member ->
                if (member.id != workspace.owner.id) {
                    workspace.removeMember(member)
                }
            }
            
            // Add new members by fetching actual Member entities
            memberIds.forEach { memberId ->
                val member = memberService.findMemberById(memberId)
                    ?: throw CustomException(ErrorInfo.TARGET_NOT_FOUND)
                
                // Don't add owner again (already added)
                if (member.id != workspace.owner.id) {
                    workspace.addMember(member)
                }
            }
        }
        
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

    override suspend fun getMyWorkspace(search: WorkspaceReq.Search?, pageable: Pageable?): Page<WorkspaceRes.Owner> {
        val member = MemberUtil.instance.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        var spec = Specification.where(WorkspaceSpecs.membersIdIn(listOf(member.id!!)))
            .or(WorkspaceSpecs.ownerIdEq(member.id!!))

        if (search != null) {
            val searchSpec = Specification.where(WorkspaceSpecs.nameLike(search.name))
                .and(WorkspaceSpecs.ownerEmailLike(search.ownerEmail))
            spec = spec.and(searchSpec)
        }

        val workspaces = workspaceRepository.findAll(spec, pageable ?: Pageable.unpaged())
        return workspaces.map { space -> modelMapper.map(space, WorkspaceRes.Owner::class.java) }
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
        if (members.isEmpty()) {
            throw CustomException(ErrorInfo.TARGET_NOT_FOUND)
        }

        members.forEach { member -> workspace.addMember(member) }
        workspaceRepository.save(workspace);
    }
}
