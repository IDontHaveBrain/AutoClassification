package cc.nobrain.dev.userserver.common

import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.context.support.WithSecurityContextFactory

class WithMockMemberSecurityContextFactory : WithSecurityContextFactory<WithMockMember> {
    override fun createSecurityContext(withMockMember: WithMockMember): SecurityContext {
        val context = SecurityContextHolder.createEmptyContext()

        val authentication = UsernamePasswordAuthenticationToken(
            withMockMember.username,
            null,
            listOf(SimpleGrantedAuthority(withMockMember.roles))
        )

        val testMember = Member(
            id = withMockMember.id,
            email = withMockMember.username,
            password = "123123",
            name = "Test User"
        )

        authentication.details = testMember
        context.authentication = authentication

        return context
    }
}
