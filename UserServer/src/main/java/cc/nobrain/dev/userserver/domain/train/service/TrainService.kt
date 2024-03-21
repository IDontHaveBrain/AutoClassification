package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.train.dto.ClassfiyDto
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import cc.nobrain.dev.userserver.domain.train.service.dto.ClassfiyRes
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.multipart.MultipartFile

interface TrainService {
    suspend fun testClassfiyData(data: List<String>, files: Array<MultipartFile>): ResponseEntity<Any>

    suspend fun getTestResultList(page: Pageable): Page<ClassfiyRes>

    suspend fun getMyImgs(): List<FileDto>

    suspend fun requestTrain(): List<FileDto>

    suspend fun deleteTrainData(id: Long)
}