package cc.nobrain.dev.userserver.common.security

import kotlinx.coroutines.ThreadContextElement
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import kotlin.coroutines.AbstractCoroutineContextElement
import kotlin.coroutines.CoroutineContext

class SecurityContextElement(private var securityContext: SecurityContext)
    : ThreadContextElement<SecurityContext>, AbstractCoroutineContextElement(Key) {
    companion object Key : CoroutineContext.Key<SecurityContextElement>

    override fun updateThreadContext(context: CoroutineContext): SecurityContext {
        val previous = SecurityContextHolder.getContext()
        SecurityContextHolder.setContext(securityContext)
        return previous
    }

    override fun restoreThreadContext(context: CoroutineContext, oldState: SecurityContext) {
        SecurityContextHolder.setContext(oldState)
    }

    private fun computeUpdatedContext(): SecurityContext {
        val current = SecurityContextHolder.getContext()
        return current
    }
}