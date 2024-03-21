package cc.nobrain.dev.userserver.common.component

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.properties.AppProps
import cc.nobrain.dev.userserver.common.utils.CryptoUtil
import cc.nobrain.dev.userserver.common.utils.FileUtil
import cc.nobrain.dev.userserver.domain.base.entity.File
import cc.nobrain.dev.userserver.domain.base.entity.TempFile
import cc.nobrain.dev.userserver.domain.base.repository.FileRepository
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import jakarta.servlet.http.HttpServletRequest
import lombok.extern.slf4j.Slf4j
import org.apache.tomcat.util.http.fileupload.IOUtils
import org.modelmapper.ModelMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.io.ByteArrayInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Files.probeContentType
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*
import java.util.zip.ZipFile
import java.util.zip.ZipInputStream

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
        val uploadedFiles = files.flatMap { processFile(it, clazz, ownerEntity) }

        return fileRepository.saveAll(uploadedFiles)
    }

    @Transactional
    protected fun <T : File> processFile(file: MultipartFile, clazz: Class<T>, ownerEntity: Any): List<T> {
        val extension = FileUtil.getExtension(file.originalFilename ?: "")

        return if (extension == ".zip") {
            processZipFile(file, clazz, ownerEntity)
        } else {
            listOf(uploadFile(file, clazz, ownerEntity))
        }
    }

    private fun <T : File> processZipFile(file: MultipartFile, clazz: Class<T>, ownerEntity: Any): List<T> {
        return ZipInputStream(file.inputStream).use { zis ->
            generateSequence { zis.nextEntry }.map { entry ->
                val content = zis.readAllBytes()
                val uploadStream = ByteArrayInputStream(content)

                val extension = FileUtil.getExtension(entry.name)
                val path = Paths.get(entry.name)
                val contentType = Files.probeContentType(path)

                val uploadedFile = uploadFile(uploadStream, entry.name, entry.size, contentType, clazz, ownerEntity)
                uploadedFile.orElse(null)
            }
                .filterNotNull()
                .toList()
        }
    }

    protected fun <T : File> uploadFile(file: MultipartFile, clazz: Class<T>, ownerEntity: Any): T {
        return try {
            if (file.isEmpty || file.size > appProps.maxFileSize) {
                throw CustomException(ErrorInfo.INVALID_DATA)
            } else {
                val filename = CryptoUtil.encryptSHA256("${file.originalFilename}-${file.size}-${System.currentTimeMillis()}")
                val originalFilename = file.originalFilename
                val size = file.size
                val contentType = file.contentType
                val extension = FileUtil.getExtension(originalFilename ?: "")

                val storagePath = getStoragePath(ownerEntity, clazz)
                val filePath = Paths.get("${appProps.path}$storagePath$filename$extension")
                Files.createDirectories(filePath.parent)
                Files.copy(file.inputStream, filePath, StandardCopyOption.REPLACE_EXISTING)

                val sourceMap = mapOf(
                        "path" to "${appProps.path}$storagePath",
                        "size" to size,
                        "contentType" to contentType,
                        "fileName" to filename,
                        "originalFileName" to originalFilename,
                        "url" to "${getBaseUrl()}$storagePath$filename$extension",
                        "fileExtension" to extension
                )

                val uploadedFile: T = modelMapper.map(sourceMap, clazz)
                uploadedFile.setRelation(ownerEntity)

                return uploadedFile;
            }
        } catch (e: IOException) {
            e.printStackTrace()
            throw RuntimeException("File upload failed", e)
        }
    }

    @Transactional
    protected fun <T : File> uploadFile(fileStream: InputStream, fileName: String, size: Long, contentType: String, clazz: Class<T>, ownerEntity: Any): Optional<T> {
        return try {
            if (size > appProps.maxFileSize) {
                Optional.empty()
            } else {
                val filename = CryptoUtil.encryptSHA256("$fileName-$size-${System.currentTimeMillis()}")
                val extension = FileUtil.getExtension(fileName ?: "")
                val filePath = Paths.get("${appProps.path}${appProps.resourcePath}$filename$extension")
                Files.copy(fileStream, filePath, StandardCopyOption.REPLACE_EXISTING)

                val sourceMap = mapOf(
                    "path" to "${appProps.path}${appProps.resourcePath}",
                    "size" to size,
                    "contentType" to contentType,
                    "fileName" to filename,
                    "originalFileName" to fileName,
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

    @Transactional
    fun uploadTempFiles(files: Array<MultipartFile>, ownerEntity: Any): List<TempFile> {
        return files.mapNotNull { file ->
            try {
                uploadTempFile(file, ownerEntity)
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }

    @Transactional
    fun uploadTempFile(file: MultipartFile, ownerEntity: Any): TempFile {
        return try {
            if (file.isEmpty || file.size > appProps.maxFileSize) {
                throw IllegalArgumentException("Invalid file")
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

                val uploadedFile: TempFile = modelMapper.map(sourceMap, TempFile::class.java)
                uploadedFile.setRelation(ownerEntity)

                fileRepository.save(uploadedFile)
            }
        } catch (e: IOException) {
            e.printStackTrace()
            throw RuntimeException("File upload failed", e)
        }
    }

    private fun getStoragePath(ownerEntity: Any, clazz: Class<*>): String {
        val id = when (ownerEntity) {
            is Workspace -> ownerEntity.id
            else -> ownerEntity::class.java.simpleName
        }
        return if (clazz == TrainFile::class.java) "workspace/$id/" else "${appProps.resourcePath}"
    }

    private fun getBaseUrl(): String {
        val requestURL = request.requestURL
        val scheme = requestURL.substring(0, requestURL.indexOf(":"))
        val serverPort = request.serverPort
        val serverName = request.serverName

        return "$scheme://$serverName${if (serverPort != 80 && serverPort != 443) ":$serverPort" else ""}/"
    }

    private fun unzipFile(zipFilePath: String, destination: String) {
        ZipFile(zipFilePath).use { zipFile ->
            val entries = zipFile.entries()

            while (entries.hasMoreElements()) {
                val entry = entries.nextElement()
                val entryDestination = java.io.File(destination, entry.name)
                if (entry.isDirectory) {
                    entryDestination.mkdirs()
                } else {
                    zipFile.getInputStream(entry).use { input ->
                        FileOutputStream(entryDestination).use { output ->
                            IOUtils.copy(input, output)
                        }
                    }
                }
            }
        }
    }
}