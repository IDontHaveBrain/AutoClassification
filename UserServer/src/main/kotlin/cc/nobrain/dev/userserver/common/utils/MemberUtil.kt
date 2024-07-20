package cc.nobrain.dev.userserver.common.utils

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.util.Optional

@Component
class MemberUtil(private val memberRepository: MemberRepository) {

    fun getCurrentUserEmail(): String {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication?.principal is Member) {
            val userDetails = authentication.principal as Member
            userDetails.username
        } else "SYSTEM"
    }

    fun getCurrentMemberDto(): Optional<Member> {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication?.principal is Member) {
            Optional.of(authentication.principal as Member)
        } else Optional.empty()
    }

    fun getCurrentMember(): Member {
        val authentication: Authentication = SecurityContextHolder.getContext().authentication

        val memberId = (authentication.principal as Member).id
            ?: throw CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND)

        return memberRepository.findById(memberId).orElseThrow {
            CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND)
        }
    }

    companion object {
        @JvmStatic
        lateinit var instance: MemberUtil
            private set

        @JvmStatic
        fun initialize(memberUtil: MemberUtil) {
            instance = memberUtil
        }
    }
}
