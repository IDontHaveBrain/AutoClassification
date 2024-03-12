package cc.nobrain.dev.userserver.common.security

import kotlinx.coroutines.ThreadContextElement
import org.springframework.transaction.support.TransactionSynchronizationManager
import kotlin.coroutines.AbstractCoroutineContextElement
import kotlin.coroutines.CoroutineContext

class TransactionContextElement(
    private var transactionName: String?,
    private var transactionReadOnly: Boolean
) : ThreadContextElement<TransactionContextElement.TransactionContext>,
    AbstractCoroutineContextElement(Key) {

    companion object Key : CoroutineContext.Key<TransactionContextElement>

    data class TransactionContext(val name: String?, val readOnly: Boolean)

    override fun updateThreadContext(context: CoroutineContext): TransactionContext {
        val previousName = TransactionSynchronizationManager.getCurrentTransactionName()
        val previousReadOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly()

        TransactionSynchronizationManager.setCurrentTransactionName(transactionName)
        TransactionSynchronizationManager.setCurrentTransactionReadOnly(transactionReadOnly)

        return TransactionContext(previousName, previousReadOnly)
    }

    override fun restoreThreadContext(context: CoroutineContext, oldState: TransactionContext) {
        TransactionSynchronizationManager.setCurrentTransactionName(oldState.name)
        TransactionSynchronizationManager.setCurrentTransactionReadOnly(oldState.readOnly)
    }
}