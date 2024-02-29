package cc.nobrain.dev.userserver.common.security

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import org.springframework.context.annotation.Configuration
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Configuration
@Service
class CustomUserDetailService(
        private val memberService: MemberService,
        private val passwordEncoder: PasswordEncoder
) : UserDetailsService {

    override fun loadUserByUsername(email: String): Member {
        val member = memberService.findMemberByEmail(email)
                ?: throw UsernameNotFoundException("User not found")
        return member
    }

    fun matches(rawPw: String, encodedPw: String): Boolean {
        return passwordEncoder.matches(rawPw, encodedPw)
    }
}