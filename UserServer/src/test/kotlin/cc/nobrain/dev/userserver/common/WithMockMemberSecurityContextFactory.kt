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
        // 테스트 동기화를 위한 데이터베이스 멤버 레지스트리
        private val memberRegistry = ConcurrentHashMap<String, Member>()
        
        /**
         * 모의 보안 컨텍스트에서 사용할 데이터베이스 멤버를 등록합니다
         */
        fun registerMember(email: String, member: Member) {
            memberRegistry[email] = member
        }
        
        /**
         * 등록된 모든 멤버를 삭제합니다 (테스트 정리 시 호출)
         */
        fun clearRegistry() {
            memberRegistry.clear()
        }
        
        /**
         * 이메일로 등록된 멤버를 조회합니다
         */
        fun getRegisteredMember(email: String): Member? {
            return memberRegistry[email]
        }
    }
    
    override fun createSecurityContext(withMockMember: WithMockMember): SecurityContext {
        val context = SecurityContextHolder.createEmptyContext()

        // 등록된 데이터베이스 멤버를 우선 사용하고, 없으면 모의 멤버로 대체
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
