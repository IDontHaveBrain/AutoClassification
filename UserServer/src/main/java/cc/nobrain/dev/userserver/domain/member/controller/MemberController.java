package cc.nobrain.dev.userserver.domain.member.controller;

import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq;
import cc.nobrain.dev.userserver.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/register")
    public MemberDto register(MemberReq.Register req) {
        return memberService.register(req);
    }

    @GetMapping("/duplicate")
    public Boolean duplicate(@RequestParam String email) {
        return memberService.duplicate(email);
    }

    @DeleteMapping("/logout")
    public Object logout() {
        return null;
    }
}
