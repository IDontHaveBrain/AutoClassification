package cc.nobrain.dev.userserver.file;

import cc.nobrain.dev.userserver.domain.base.dto.FileDto;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile;
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository;
import cc.nobrain.dev.userserver.domain.train.service.TrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Before;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
@Rollback
@Slf4j
public class FileTest {

    @Autowired
    private TrainService trainService;

    @Autowired
    private TrainFileRepository trainFileRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Test
    public void test() {
        // given
        List<TrainFile> files = trainFileRepository.findByOwnerIndexId(1L);

        log.info("size : {}", files.size());

        List<FileDto> dtos = files.stream().map(file -> modelMapper.map(file, FileDto.class)).toList();

        log.info("Finish!");
    }
}
