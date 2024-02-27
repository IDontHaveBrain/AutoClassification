package cc.nobrain.dev.userserver.domain.train.controller;

import cc.nobrain.dev.userserver.domain.train.service.TrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/train")
public class TrainController {

    private final TrainService trainService;

    @PostMapping("/upload")
    public Long uploadTrainData(MultipartFile[] files) {
        return trainService.uploadTrainData(files);
    }
}
