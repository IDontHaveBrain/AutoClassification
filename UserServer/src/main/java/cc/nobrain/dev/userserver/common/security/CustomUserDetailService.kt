package cc.nobrain.dev.userserver.common.security

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class CustomUserDetailService(
        private val memberRepository: MemberRepository,
        private val passwordEncoder: PasswordEncoder
) : UserDetailsService {

    override fun loadUserByUsername(email: String): Member {
        val member = memberRepository.findByEmailAndIsVerified(email, true)
                ?: throw UsernameNotFoundException("User not found")
        return member
    }

    fun matches(rawPw: String, encodedPw: String): Boolean {
        return passwordEncoder.matches(rawPw, encodedPw)
    }
}