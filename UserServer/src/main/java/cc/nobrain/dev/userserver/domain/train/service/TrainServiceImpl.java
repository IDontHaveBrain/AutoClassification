package cc.nobrain.dev.userserver.domain.train.service;

import cc.nobrain.dev.userserver.common.component.FileComponent;
import cc.nobrain.dev.userserver.common.exception.CustomException;
import cc.nobrain.dev.userserver.common.exception.ErrorInfo;
import cc.nobrain.dev.userserver.common.utils.GlobalUtil;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class TrainServiceImpl implements TrainService {

    private final FileComponent fileComponent;

    @Override
    public Long uploadTrainData(MultipartFile[] files) {
        Member member = GlobalUtil.getCurrentMember()
                .orElseThrow(() -> new CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND));

        fileComponent.uploadFiles(files, Member);

        return null;
    }
}
