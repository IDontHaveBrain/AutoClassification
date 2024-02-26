package cc.nobrain.dev.userserver.domain.train.service;

import org.springframework.web.multipart.MultipartFile;

public interface TrainService {
    Long uploadTrainData(MultipartFile[] files);
}
