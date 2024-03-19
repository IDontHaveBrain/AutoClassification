package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import org.springframework.http.ResponseEntity
import org.springframework.web.multipart.MultipartFile

interface TrainService {
    suspend fun testClassfiyData(data: List<String>, files: Array<MultipartFile>): ResponseEntity<Any>

    suspend fun getMyImgs(): List<FileDto>

    suspend fun requestTrain(): List<FileDto>

    suspend fun deleteTrainData(id: Long)
}