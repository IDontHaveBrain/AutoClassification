package cc.nobrain.dev.userserver.domain.base.controller

import cc.nobrain.dev.userserver.common.component.FileComponent
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class GlobalController(private val fileComponent: FileComponent) {

    @GetMapping("/health")
    fun health(): ResponseEntity<Unit> {
        return ResponseEntity.ok().build()
    }
}