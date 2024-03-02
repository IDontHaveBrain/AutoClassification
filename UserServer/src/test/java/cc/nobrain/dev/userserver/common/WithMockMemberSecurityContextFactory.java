package cc.nobrain.dev.userserver.common;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Arrays;

public class WithMockMemberSecurityContextFactory implements WithSecurityContextFactory<WithMockMember> {
    @Override
    public SecurityContext createSecurityContext(WithMockMember withMockMember) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        withMockMember.username(),
                        null,
                        Arrays.asList(new SimpleGrantedAuthority(withMockMember.roles())));

        Member testMember = Member.builder()
                .id(withMockMember.id())
                .email(withMockMember.username())
                .password("123123")
                .build();

        authentication.setDetails(testMember);
        context.setAuthentication(authentication);

        return context;
    }
}