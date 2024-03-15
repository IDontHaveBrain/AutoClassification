package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface MemberService {
    suspend fun register(req: MemberReq.Register): MemberDto

    suspend fun duplicate(email: String): Boolean

    suspend fun getMyInfo(): MemberDto

    suspend fun findMemberById(id: Long): Member?

    suspend fun findMemberByEmail(email: String): Member?

    suspend fun findMemberByEmails(emails: MutableList<String>): List<Member>

    suspend fun search(email: String, pageable: Pageable): Page<MemberDto>
}