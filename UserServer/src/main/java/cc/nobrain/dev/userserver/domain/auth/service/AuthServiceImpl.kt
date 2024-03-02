package cc.nobrain.dev.userserver.domain.auth.service

import cc.nobrain.dev.userserver.common.properties.AuthProps
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AuthServiceImpl(private val authProps: AuthProps) : AuthService {

    override fun getPublicKey(): String {
        return authProps.signKey
    }
}