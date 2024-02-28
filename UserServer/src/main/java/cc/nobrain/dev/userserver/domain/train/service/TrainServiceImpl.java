package cc.nobrain.dev.userserver.domain.train.service;

import cc.nobrain.dev.userserver.common.component.FileComponent;
import cc.nobrain.dev.userserver.common.exception.CustomException;
import cc.nobrain.dev.userserver.common.exception.ErrorInfo;
import cc.nobrain.dev.userserver.common.utils.GlobalUtil;
import cc.nobrain.dev.userserver.domain.base.dto.FileDto;
import cc.nobrain.dev.userserver.domain.base.repository.FileRepository;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository;
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile;
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainServiceImpl implements TrainService {

    private final TrainFileRepository trainFileRepository;
    private final FileComponent fileComponent;

    private final MemberRepository memberRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public Long uploadTrainData(MultipartFile[] files) {
        Member member = GlobalUtil.getCurrentMember()
                .orElseThrow(() -> new CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND));
        member = memberRepository.findById(member.getId())
                .orElseThrow(() -> new CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND));

        List<TrainFile> success = fileComponent.uploadFile(files, TrainFile.class, member);

        return (long)success.size();
    }

    @Override
    public List<FileDto> getMyImgs() {
        Member member = GlobalUtil.getCurrentMember()
                .orElseThrow(() -> new CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND));

        List<TrainFile> files = trainFileRepository.findByOwnerIndexId(member.getId());
        return files.stream().map(file -> modelMapper.map(file, FileDto.class)).toList();
    }
}
