package cc.nobrain.dev.userserver.domain.base.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.http.HttpResponse;

@RestController
@RequiredArgsConstructor
public class GlobalController {

    @GetMapping("/health")
    public ResponseEntity health() {
        return ResponseEntity.ok().build();
    }
}
