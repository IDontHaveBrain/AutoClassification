package cc.nobrain.dev.userserver.domain.base.controller;

import cc.nobrain.dev.userserver.common.component.FileComponent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.http.HttpResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class GlobalController {

    private final FileComponent fileComponent;

    @GetMapping("/health")
    public ResponseEntity health() {
        return ResponseEntity.ok().build();
    }
}
