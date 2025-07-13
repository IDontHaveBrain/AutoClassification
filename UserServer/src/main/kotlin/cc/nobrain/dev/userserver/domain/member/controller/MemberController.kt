package cc.nobrain.dev.userserver.domain.member.controller

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import kotlinx.coroutines.runBlocking
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/member")
class MemberController(private val memberService: MemberService) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody req: MemberReq.Register, request: HttpServletRequest): ResponseEntity<Any> {
        return try {
            val result = runBlocking { memberService.register(req, request) }
            ResponseEntity.ok(result)
        } catch (e: CustomException) {
            val response = mapOf(
                "status" to e.status,
                "error" to e.code,
                "message" to (e.message ?: "An error occurred")
            )
            ResponseEntity.status(e.status).body(response)
        }
    }

    @GetMapping("/verify")
    fun verifyToken(@RequestParam token: String, request: HttpServletRequest): ResponseEntity<Any> {
        return try {
            val result = runBlocking { memberService.verifyToken(token, request) }
            result as ResponseEntity<Any>
        } catch (e: CustomException) {
            val response = mapOf(
                "status" to e.status,
                "error" to e.code,
                "message" to (e.message ?: "An error occurred")
            )
            ResponseEntity.status(e.status).body(response)
        }
    }

    @GetMapping("/duplicate")
    fun duplicate(@RequestParam email: String): String {
        val isDuplicate = runBlocking { memberService.duplicate(email) }
        return isDuplicate.toString()
    }

    @GetMapping("/me")
    fun getMyInfo(): MemberDto {
        return runBlocking { memberService.getMyInfo() }
    }

    @DeleteMapping("/logout")
    fun logout(): Any? {
        return null
    }

    @GetMapping("/search")
    fun search(@RequestParam email: String, pageable: Pageable): Page<MemberDto> {
        return runBlocking { memberService.search(email, pageable) }
    }

}