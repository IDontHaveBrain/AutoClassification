package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import jakarta.servlet.http.HttpServletRequest
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity

interface MemberService {
    suspend fun register(req: MemberReq.Register, request: HttpServletRequest): MemberDto

    suspend fun verifyToken(token: String, request: HttpServletRequest): ResponseEntity<Void>

    suspend fun duplicate(email: String): Boolean

    suspend fun getMyInfo(): MemberDto

    suspend fun findMemberById(id: Long): Member?

    suspend fun findMemberByEmail(email: String): Member?

    suspend fun findMemberByEmails(emails: MutableList<String>): List<Member>

    suspend fun search(email: String, pageable: Pageable): Page<MemberDto>
}