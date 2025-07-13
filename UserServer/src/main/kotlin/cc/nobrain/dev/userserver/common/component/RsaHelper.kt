package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.properties.AuthProps
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.stereotype.Component
import java.security.KeyFactory
import java.security.interfaces.RSAPrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import javax.crypto.Cipher
import org.slf4j.LoggerFactory

@Component
class RsaHelper(private val authProps: AuthProps) {

    private val logger = LoggerFactory.getLogger(RsaHelper::class.java)

    val publicKey: String
        get() = authProps.signKey

    fun decrypt(encryptedData: String): String {
        return try {
            val encryptedBytes = Base64.getDecoder().decode(encryptedData)

            val keyFactory = KeyFactory.getInstance("RSA")
            val decodedKey = Base64.getDecoder().decode(authProps.privateKey)
            val keySpec = PKCS8EncodedKeySpec(decodedKey)
            val privKey = keyFactory.generatePrivate(keySpec) as RSAPrivateKey

            val cipher = Cipher.getInstance("RSA/ECB/PKCS1PADDING")
            cipher.init(Cipher.DECRYPT_MODE, privKey)

            val decryptedBytes = cipher.doFinal(encryptedBytes)
            String(decryptedBytes)
        } catch (e: Exception) {
            logger.error("RSA decrypt error", e)
            throw OAuth2AuthenticationException("invalid")
        }
    }

    fun encrypt(data: String): String {
        return try {
            val keyFactory = KeyFactory.getInstance("RSA")
            val decodedKey = Base64.getDecoder().decode(authProps.signKey)
            val keySpec = X509EncodedKeySpec(decodedKey)
            val pubKey = keyFactory.generatePublic(keySpec)

            val cipher = Cipher.getInstance("RSA/ECB/PKCS1PADDING")
            cipher.init(Cipher.ENCRYPT_MODE, pubKey)

            val encryptedBytes = cipher.doFinal(data.toByteArray())
            Base64.getEncoder().encodeToString(encryptedBytes)
        } catch (e: Exception) {
            logger.error("RSA encrypt error", e)
            throw OAuth2AuthenticationException("invalid")
        }
    }
}