package cc.nobrain.dev.userserver.common.utils

import java.math.BigInteger
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

object CryptoUtil {
    @JvmStatic
    fun encryptSHA256(str: String): String {
        return try {
            val md = MessageDigest.getInstance("SHA-256")
            val hash = md.digest(str.toByteArray(StandardCharsets.UTF_8))
            val number = BigInteger(1, hash)
            var hexString = StringBuilder(number.toString(16))
            while (hexString.length < 32) {
                hexString.insert(0, '0')
            }
            hexString.toString()
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }
}