package cc.nobrain.dev.userserver.security;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository;
import cc.nobrain.dev.userserver.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Member loadUserByUsername(String email) throws UsernameNotFoundException {
        Member member = memberService.findMemberByEmail(email);
        if (Objects.isNull(member)) {
            throw new UsernameNotFoundException("User not found");
        }
        return member;
    }



    public boolean matches(String rawPw, String encodedPw) {
        return this.passwordEncoder.matches(rawPw, encodedPw);
    }
}
