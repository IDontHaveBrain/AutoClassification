package cc.nobrain.dev.userserver.domain.train.controller

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/train")
class TrainController(
    private val trainService: TrainService
) {

    @PostMapping("/test/upload")
    suspend fun testClassfiy(@RequestPart data: List<String>,
                                @RequestPart files: Array<MultipartFile>): ResponseEntity<Any> {
        return trainService.testClassfiyData(data, files);
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