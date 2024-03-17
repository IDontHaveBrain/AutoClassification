package cc.nobrain.dev.userserver.domain.auth.controller

import cc.nobrain.dev.userserver.domain.auth.service.AuthService
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    private val authService: AuthService,
    private val memberService: MemberService
) {

    @GetMapping("/key")
    suspend fun getPublicKey(): String {
        return authService.getPublicKey()
    }


}