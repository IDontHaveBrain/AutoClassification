package cc.nobrain.dev.userserver.domain.auth.service

interface AuthService {
    suspend fun getPublicKey(): String
}