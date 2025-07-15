package cc.nobrain.dev.userserver.domain.member.controller

import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import jakarta.servlet.http.HttpServletRequest
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/member")
class MemberController(private val memberService: MemberService) {

    @PostMapping("/register")
    suspend fun register(@RequestBody req: MemberReq.Register, request: HttpServletRequest): MemberDto {
        return memberService.register(req, request)
    }

    @GetMapping("/verify")
    suspend fun verifyToken(token: String, request: HttpServletRequest): ResponseEntity<Void> {
        return memberService.verifyToken(token, request)
    }

    @GetMapping("/duplicate")
    suspend fun duplicate(@RequestParam email: String): Boolean {
        return memberService.duplicate(email)
    }

    @GetMapping("/me")
    suspend fun getMyInfo(): MemberDto {
        return memberService.getMyInfo();
    }

    @DeleteMapping("/logout")
    suspend fun logout(): Any? {
        return null
    }

    @GetMapping("/search")
    suspend fun search(@RequestParam email: String, pageable: Pageable): Page<MemberDto> {
        return memberService.search(email, pageable)
    }

}