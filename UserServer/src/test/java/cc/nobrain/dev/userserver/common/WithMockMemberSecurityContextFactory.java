package cc.nobrain.dev.userserver.common;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Collections;

public class WithMockMemberSecurityContextFactory implements WithSecurityContextFactory<WithMockMember> {
    @Override
    public SecurityContext createSecurityContext(WithMockMember withMockMember) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        Member principal = Member.builder()
                .id(withMockMember.id())
                .email(withMockMember.username())
                .password("password")
                .name("user")
                .memberGroup(null)
                .build();
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "password", principal.getAuthorities());
        context.setAuthentication(auth);

        return context;
    }
}