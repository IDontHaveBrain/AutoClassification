package cc.nobrain.dev.userserver.common.utils

import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import java.util.Optional

object MemberUtil {
    @JvmStatic
    fun getCurrentUserEmail(): String {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication?.principal is UserDetails) {
            val userDetails = authentication.principal as UserDetails
            userDetails.username
        } else "SYSTEM"
    }

    @JvmStatic
    fun getCurrentMember(): Optional<Member> {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication?.principal is Member) {
            Optional.of(authentication.principal as Member)
        } else Optional.empty()
    }
}