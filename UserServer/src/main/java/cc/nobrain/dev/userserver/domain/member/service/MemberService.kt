package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq

interface MemberService {
    fun register(req: MemberReq.Register): MemberDto

    fun duplicate(email: String): Boolean

    fun getMyInfo(): MemberDto

    fun findMemberById(id: Long): Member?

    fun findMemberByEmail(email: String): Member?
}