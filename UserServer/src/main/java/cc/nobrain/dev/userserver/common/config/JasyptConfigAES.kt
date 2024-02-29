package cc.nobrain.dev.userserver.common.config

import org.jasypt.encryption.StringEncryptor
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JasyptConfigAES {

    // TODO: 추후 환경변수로 변경

    @Value("\${jasypt.encryptor.password}")
    private lateinit var PASSWORD_KEY: String

    @Bean("jasyptStringEncryptor")
    fun stringEncryptor(): StringEncryptor{
        val encryptor = PooledPBEStringEncryptor()
        val config = SimpleStringPBEConfig().apply {
            password = PASSWORD_KEY
            algorithm = "PBEWithMD5AndDES"
            keyObtentionIterations = 1000
            poolSize = 1
            stringOutputType = "base64"
            setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator")
        }
        encryptor.setConfig(config)
        return encryptor
    }
}