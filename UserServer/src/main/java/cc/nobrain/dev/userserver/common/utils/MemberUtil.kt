package cc.nobrain.dev.userserver.common.utils

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import java.util.Optional

object MemberUtil {

    @JvmField
    @Autowired
    var memberRepository: MemberRepository? = null

    @JvmStatic
    fun getCurrentUserEmail(): String {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication?.principal is Member) {
            val userDetails = authentication.principal as Member
            userDetails.username
        } else "SYSTEM"
    }

    @JvmStatic
    fun getCurrentMemberDto(): Optional<Member> {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication?.principal is Member) {
            Optional.of(authentication.principal as Member)
        } else Optional.empty()
    }

    @JvmStatic
    fun getCurrentMember(): Member {
        val authentication: Authentication = SecurityContextHolder.getContext().authentication
        val memberRepository = CommonUtil.getBean("memberRepository") as? MemberRepository;

        return memberRepository?.findById((authentication.principal as Member).id)?.orElseThrow()
            ?: throw CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND);
    }
}