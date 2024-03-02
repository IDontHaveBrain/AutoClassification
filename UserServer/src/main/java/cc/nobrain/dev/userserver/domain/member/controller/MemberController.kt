package cc.nobrain.dev.userserver.domain.member.controller

import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/member")
class MemberController(private val memberService: MemberService) {

    @PostMapping("/register")
    fun register(@RequestBody req: MemberReq.Register): MemberDto {
        return memberService.register(req)
    }

    @GetMapping("/duplicate")
    fun duplicate(@RequestParam email: String): Boolean {
        return memberService.duplicate(email)
    }

    @GetMapping("/me")
    fun getMyInfo(): MemberDto {
        return memberService.getMyInfo();
    }

    @DeleteMapping("/logout")
    fun logout(): Any? {
        return null
    }
}