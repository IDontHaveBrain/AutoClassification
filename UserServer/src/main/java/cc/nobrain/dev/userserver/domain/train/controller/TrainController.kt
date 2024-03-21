package cc.nobrain.dev.userserver.domain.train.controller

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.train.dto.ClassfiyDto
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import cc.nobrain.dev.userserver.domain.train.service.dto.ClassfiyRes
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/train")
class TrainController(
    private val trainService: TrainService
) {

    @PostMapping("/test/upload", consumes = ["application/json", MediaType.MULTIPART_FORM_DATA_VALUE])
    suspend fun testClassfiy(@RequestPart("data") data: MutableList<String>,
                                @RequestPart("files") files: Array<MultipartFile>): ResponseEntity<Any> {
        return trainService.testClassfiyData(data, files);
    }

    @GetMapping("/test")
    suspend fun test(pageable: Pageable): Page<ClassfiyRes> {
        return trainService.getTestResultList(pageable);
    }

    @GetMapping
    suspend fun getMyImgs(): List<FileDto> {
        return trainService.getMyImgs();
    }

    @PostMapping("/train")
    suspend fun requestTrain(): List<FileDto> {
        return trainService.requestTrain();
    }

    @DeleteMapping("/{id}")
    suspend fun deleteTrainData(@PathVariable id: Long) {
        trainService.deleteTrainData(id);
    }
}