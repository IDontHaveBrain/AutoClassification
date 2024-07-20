package cc.nobrain.dev.userserver.common

import org.springframework.security.test.context.support.WithSecurityContext

@Retention(AnnotationRetention.RUNTIME)
@WithSecurityContext(factory = WithMockMemberSecurityContextFactory::class)
annotation class WithMockMember(
    val username: String = "test@test.com",
    val roles: String = "MEMBER",
    val id: Long = 1L
)