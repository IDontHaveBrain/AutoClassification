package cc.nobrain.dev.userserver.common.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Convert;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Convert
@RequiredArgsConstructor
public class BCryptoConverter implements AttributeConverter<String, String> {

    private final PasswordEncoder passwordEncoder;

    @Override
    public String convertToDatabaseColumn(String plainText) {
        return Optional.ofNullable(plainText)
                .map(passwordEncoder::encode)
                .orElse(null);
    }

    @Override
    public String convertToEntityAttribute(String encrypted) {
        return encrypted;
    }

}
