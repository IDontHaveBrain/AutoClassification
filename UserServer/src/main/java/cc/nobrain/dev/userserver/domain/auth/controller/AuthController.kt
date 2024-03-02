package cc.nobrain.dev.userserver.domain.auth.controller

import cc.nobrain.dev.userserver.domain.auth.service.AuthService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {

    @GetMapping("/key")
    fun getPublicKey(): String {
        return authService.getPublicKey()
    }
}