package cc.nobrain.dev.userserver.common.component;

import cc.nobrain.dev.userserver.common.properties.AppProps;
import cc.nobrain.dev.userserver.domain.base.entity.File;
import cc.nobrain.dev.userserver.domain.base.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Component
@RequiredArgsConstructor
public class FileComponent {

    private final ModelMapper modelMapper;
    private final FileRepository fileRepository;
    private final AppProps appProps;

    public <T extends File> List<T> uploadFile(MultipartFile[] files, Class<T> clazz, Object ownerEntity) {
        List<T> result = new ArrayList<>();
        if (Objects.isNull(files) || files.length < 1) {
            return result;
        }
        for (MultipartFile file : files) {
            Optional<T> uploadedFile = uploadFile(file, clazz, ownerEntity);
            uploadedFile.ifPresent(result::add);
        }
        fileRepository.save(result);
        return result;
    }

    protected <T extends File> Optional<T> uploadFile(MultipartFile file, Class<T> clazz, Object ownerEntity) {
        try {
            if (file.isEmpty() || file.getSize() > appProps.getMaxFileSize()) {
                return Optional.empty();
            }

            String filename = file.getOriginalFilename();
            long size = file.getSize();
            String contentType = file.getContentType();

            Path filePath = Paths.get(appProps.getPath() + filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Map<String, Object> sourceMap = new HashMap<>();
            sourceMap.put("path", filePath.toString());
            sourceMap.put("size", size);
            sourceMap.put("mimeType", contentType);
            sourceMap.put("fileName", filename);

            T uploadedFile = modelMapper.map(sourceMap, clazz);
            uploadedFile.setRelation(ownerEntity);

            return Optional.ofNullable(uploadedFile);
        } catch (IOException e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }
}