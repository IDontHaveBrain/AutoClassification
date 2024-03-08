package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq

interface MemberService {
    suspend fun register(req: MemberReq.Register): MemberDto

    suspend fun duplicate(email: String): Boolean

    suspend fun getMyInfo(): MemberDto

    suspend fun findMemberById(id: Long): Member?

    suspend fun findMemberByEmail(email: String): Member?
}