package cc.nobrain.dev.userserver

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.util.Base64

@SpringBootTest
class GenerateKey {

    @Test
    fun gen() {
        val keyPair = generateRsaKey()

        val encodedPublicKey = Base64.getEncoder().encodeToString(keyPair.public.encoded)
        val encodedPrivateKey = Base64.getEncoder().encodeToString(keyPair.private.encoded)

        println("Public : $encodedPublicKey")
        println("Private : $encodedPrivateKey")

        println("Finish")
    }

    private fun generateRsaKey(): KeyPair {
        return try {
            val keyPairGenerator = KeyPairGenerator.getInstance("RSA")
            keyPairGenerator.initialize(2048)
            keyPairGenerator.generateKeyPair()
        } catch (ex: Exception) {
            throw IllegalStateException(ex)
        }
    }
}
