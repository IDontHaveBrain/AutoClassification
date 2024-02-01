package cc.nobrain.dev.userserver.security;

import lombok.Getter;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
public class PasswordConfig {
    public static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
}
