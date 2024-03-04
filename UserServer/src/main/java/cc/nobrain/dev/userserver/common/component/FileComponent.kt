package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.properties.AppProps
import cc.nobrain.dev.userserver.common.utils.CryptoUtil
import cc.nobrain.dev.userserver.common.utils.FileUtil
import cc.nobrain.dev.userserver.domain.base.entity.File
import cc.nobrain.dev.userserver.domain.base.repository.FileRepository
import jakarta.servlet.http.HttpServletRequest
import lombok.extern.slf4j.Slf4j
import org.modelmapper.ModelMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*

@Component
class FileComponent(
        private val modelMapper: ModelMapper,
        private val fileRepository: FileRepository<File>,
        private val appProps: AppProps,
        private val request: HttpServletRequest
) {

    @Transactional
    fun <T : File> deleteFile(file: T) {
        val filePath = Paths.get("${appProps.path}${appProps.resourcePath}${file.fileName}${file.fileExtension}")
        if (Files.exists(filePath)) {
            Files.delete(filePath)
            fileRepository.delete(file)
        } else {
            println("File not found")
            fileRepository.delete(file)
        }
        fileRepository.delete(file)
    }

    @Transactional
    fun <T : File> uploadFile(files: Array<MultipartFile>, clazz: Class<T>, ownerEntity: Any): List<T> {
        val result = mutableListOf<T>()
        if (files.isNullOrEmpty()) {
            return result
        }
        for (file in files) {
            val uploadedFile = uploadFile(file, clazz, ownerEntity)
            uploadedFile.ifPresent { uploadedFileResult: T -> result.add(uploadedFileResult) }
        }
        return fileRepository.saveAll(result)
    }

    @Transactional
    protected fun <T : File> uploadFile(file: MultipartFile, clazz: Class<T>, ownerEntity: Any): Optional<T> {
        return try {
            if (file.isEmpty || file.size > appProps.maxFileSize) {
                Optional.empty()
            } else {
                val filename = CryptoUtil.encryptSHA256("${file.originalFilename}-${file.size}-${System.currentTimeMillis()}")
                val originalFilename = file.originalFilename
                val size = file.size
                val contentType = file.contentType
                val extension = FileUtil.getExtension(originalFilename ?: "")

                val filePath = Paths.get("${appProps.path}${appProps.resourcePath}$filename$extension")
                Files.copy(file.inputStream, filePath, StandardCopyOption.REPLACE_EXISTING)

                val sourceMap = mapOf(
                        "path" to "${appProps.path}${appProps.resourcePath}",
                        "size" to size,
                        "contentType" to contentType,
                        "fileName" to filename,
                        "originalFileName" to originalFilename,
                        "url" to "${getBaseUrl()}${appProps.resourcePath}$filename$extension",
                        "fileExtension" to extension
                )

                val uploadedFile: T = modelMapper.map(sourceMap, clazz)
                uploadedFile.setRelation(ownerEntity)

                Optional.ofNullable(uploadedFile)
            }
        } catch (e: IOException) {
            e.printStackTrace()
            Optional.empty()
        }
    }

    private fun getBaseUrl(): String {
        val requestURL = request.requestURL
        val scheme = requestURL.substring(0, requestURL.indexOf(":"))
        val serverPort = request.serverPort
        val serverName = request.serverName

        return "$scheme://$serverName${if (serverPort != 80 && serverPort != 443) ":$serverPort" else ""}/"
    }
}