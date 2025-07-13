package cc.nobrain.dev.userserver.common

import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.context.support.WithSecurityContextFactory
import java.util.concurrent.ConcurrentHashMap

class WithMockMemberSecurityContextFactory : WithSecurityContextFactory<WithMockMember> {
    
    companion object {
        // Registry to hold database members for test synchronization
        private val memberRegistry = ConcurrentHashMap<String, Member>()
        
        /**
         * Register a database member for use in mock security context
         */
        fun registerMember(email: String, member: Member) {
            memberRegistry[email] = member
        }
        
        /**
         * Clear all registered members (call in test cleanup)
         */
        fun clearRegistry() {
            memberRegistry.clear()
        }
        
        /**
         * Get registered member by email
         */
        fun getRegisteredMember(email: String): Member? {
            return memberRegistry[email]
        }
    }
    
    override fun createSecurityContext(withMockMember: WithMockMember): SecurityContext {
        val context = SecurityContextHolder.createEmptyContext()

        // Try to use registered database member first, fallback to mock member
        val testMember = getRegisteredMember(withMockMember.username) ?: Member(
            id = withMockMember.id,
            email = withMockMember.username,
            password = "123123!",
            name = "Test User",
            isVerified = true
        )

        val authentication = UsernamePasswordAuthenticationToken(
            testMember,
            null,
            listOf(SimpleGrantedAuthority(withMockMember.roles))
        )

        context.authentication = authentication

        return context
    }
}
