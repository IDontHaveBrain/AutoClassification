package cc.nobrain.dev.userserver.domain.train.controller

import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.train.service.TrainService
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/train")
class TrainController(
    private val trainService: TrainService
) {

    @PostMapping("/upload")
    fun uploadTrainData(@RequestParam files: Array<MultipartFile>): List<FileDto> {
        return trainService.uploadTrainData(files);
    }

    @GetMapping
    fun getMyImgs(): List<FileDto> {
        return trainService.getMyImgs();
    }

    @PostMapping("/train")
    fun requestTrain(): List<FileDto> {
        return trainService.requestTrain();
    }

    @DeleteMapping("/{id}")
    fun deleteTrainData(@PathVariable id: Long) {
        trainService.deleteTrainData(id);
    }
}