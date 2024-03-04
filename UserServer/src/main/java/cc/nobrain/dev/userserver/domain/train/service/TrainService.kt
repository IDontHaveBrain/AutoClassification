package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import org.springframework.web.multipart.MultipartFile

interface TrainService {
    fun uploadTrainData(files: Array<MultipartFile>): List<FileDto>

    fun getMyImgs(): List<FileDto>

    fun requestTrain(): List<FileDto>

    fun deleteTrainData(id: Long)
}