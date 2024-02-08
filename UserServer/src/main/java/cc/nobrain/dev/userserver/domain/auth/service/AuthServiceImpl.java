package cc.nobrain.dev.userserver.domain.auth.service;

import cc.nobrain.dev.userserver.common.properties.AuthProps;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthProps authProps;

    @Override
    public String getPublicKey() {
        return authProps.getSignKey();
    }
}
