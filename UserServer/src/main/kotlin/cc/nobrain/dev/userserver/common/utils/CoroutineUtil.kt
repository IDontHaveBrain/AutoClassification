package cc.nobrain.dev.userserver.common.utils

import cc.nobrain.dev.userserver.common.security.SecurityContextElement
import cc.nobrain.dev.userserver.common.security.TransactionContextElement
import kotlinx.coroutines.Dispatchers
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.transaction.support.TransactionSynchronizationManager
import kotlin.coroutines.CoroutineContext

object CoroutineUtil {
    val securedIO: CoroutineContext
        get() = Dispatchers.IO + SecurityContextElement(SecurityContextHolder.getContext())

    val securedIOWithTransaction: CoroutineContext
        get() {
            val transactionName = TransactionSynchronizationManager.getCurrentTransactionName()
            val transactionReadOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly()
            val transactionContext = TransactionContextElement(transactionName, transactionReadOnly)
            return securedIO + transactionContext
        }
}