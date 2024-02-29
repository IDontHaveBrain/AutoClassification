package cc.nobrain.dev.userserver.common.security;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;

@RequiredArgsConstructor
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final CustomUserDetailService customUserDetailService;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getClaimAsString("sub");
        Member member = customUserDetailService.loadUserByUsername(username);

        if(member == null){
            throw new UsernameNotFoundException("User not found");
        }

        return new UsernamePasswordAuthenticationToken(member, jwt, member.getAuthorities());
    }
}
