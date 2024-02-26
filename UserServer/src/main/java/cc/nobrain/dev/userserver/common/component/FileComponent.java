package cc.nobrain.dev.userserver.common.component;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class FileComponent {

    public <T extends File> T uploadFiles(MultipartFile[] files, Class<T> clazz) {
        MultipartFile file = files[0]; // 일단 첫번째 파일만 사용해봅시다. 여러 파일이면 loop를 사용하시면 됩니다.
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);

            // 이제 JSON parser를 사용해서 내용을 클래스로 변환하겠습니다.
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(content, clazz);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
