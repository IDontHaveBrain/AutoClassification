package cc.nobrain.dev.userserver.domain.train.service;

import cc.nobrain.dev.userserver.domain.base.dto.FileDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TrainService {
    Long uploadTrainData(MultipartFile[] files);

    List<FileDto> getMyImgs();
}
