package cc.nobrain.dev.userserver.common.component;

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
    private final String uploadPath = "/path/to/your/upload/directory/";

    public <T extends File> List<T> uploadFile(MultipartFile[] files, Class<T> clazz, Object ownerEntity) {
        List<T> result = new ArrayList<>();
        for (MultipartFile file : files) {
            Optional<T> uploadedFile = uploadFile(file, clazz, ownerEntity);
            uploadedFile.ifPresent(result::add);
        }
        fileRepository.save(result);
        return result;
    }

    private <T extends File> Optional<T> uploadFile(MultipartFile file, Class<T> clazz, Object ownerEntity) {
        try {
            String filename = file.getOriginalFilename();
            long size = file.getSize();
            String contentType = file.getContentType();

            Path filePath = Paths.get(uploadPath + filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            //Preparing a source map with file details
            Map<String, Object> sourceMap = new HashMap<>();
            sourceMap.put("path", filePath.toString());
            sourceMap.put("size", size);
            sourceMap.put("mimeType", contentType);
            sourceMap.put("fileName", filename);

            //Using ModelMapper to map the source map to the instance of File
            T uploadedFile = modelMapper.map(sourceMap, clazz);
            uploadedFile.setRelation(ownerEntity);
//            fileRepository.save(uploadedFile);

            return Optional.ofNullable(uploadedFile);
        } catch (IOException e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }
}