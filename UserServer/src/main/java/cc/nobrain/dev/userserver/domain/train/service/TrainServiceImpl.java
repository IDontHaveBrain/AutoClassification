package cc.nobrain.dev.userserver.domain.train.service;

import cc.nobrain.dev.userserver.common.component.FileComponent;
import cc.nobrain.dev.userserver.common.exception.CustomException;
import cc.nobrain.dev.userserver.common.exception.ErrorInfo;
import cc.nobrain.dev.userserver.common.utils.GlobalUtil;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainServiceImpl implements TrainService {

    private final FileComponent fileComponent;

    @Override
    @Transactional
    public Long uploadTrainData(MultipartFile[] files) {
        Member member = GlobalUtil.getCurrentMember()
                .orElseThrow(() -> new CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND));

        List<TrainFile> success = fileComponent.uploadFile(files, TrainFile.class, member);

        return (long)success.size();
    }
}
