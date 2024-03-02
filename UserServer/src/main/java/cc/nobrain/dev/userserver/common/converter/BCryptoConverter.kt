package cc.nobrain.dev.userserver.common.converter

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Convert
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.Optional

@Convert
class BCryptoConverter(private val passwordEncoder: PasswordEncoder) : AttributeConverter<String, String> {

    override fun convertToDatabaseColumn(plainText: String?): String? {
        return Optional.ofNullable(plainText)
                .map(passwordEncoder::encode)
                .orElse(null)
    }

    override fun convertToEntityAttribute(encrypted: String?): String? {
        return encrypted
    }
}