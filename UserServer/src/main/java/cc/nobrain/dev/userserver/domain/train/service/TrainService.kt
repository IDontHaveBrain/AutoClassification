package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import org.springframework.web.multipart.MultipartFile

interface TrainService {
    suspend fun uploadTrainData(files: Array<MultipartFile>): List<FileDto>

    suspend fun getMyImgs(): List<FileDto>

    suspend fun requestTrain(): List<FileDto>

    suspend fun deleteTrainData(id: Long)
}