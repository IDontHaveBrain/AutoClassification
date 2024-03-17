package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.common.component.FileComponent
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import org.modelmapper.ModelMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.reactive.function.client.WebClient

@Service
@Transactional(readOnly = true)
class TrainServiceImpl(
    private val trainFileRepository: TrainFileRepository,
    private val fileComponent: FileComponent,
    private val memberRepository: MemberRepository,
    private val modelMapper: ModelMapper,
    private val workspaceService: WorkspaceService,
    private val webClient: WebClient,
) : TrainService {

    @Transactional
    override suspend fun uploadTrainData(files: Array<MultipartFile>): List<FileDto> {
        var member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        member = memberRepository.findById(member.id)
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val success = fileComponent.uploadTempFiles(files)

        val testImages = success.map { it.url }
        val testClass = listOf("cat", "dog", "wolf", "duck")

        val requestBody = mapOf(
            "testClass" to testClass,
            "testImages" to testImages
        )

        val response = webClient.post()
            .uri("http://localhost:5000/api/train")
            .header("x-api-key", "test")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String::class.java)
            .block()

        println(response)

        return emptyList()
    }

    override suspend fun getMyImgs(): List<FileDto> {
        val member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val workspaces = workspaceService.getMyWorkspace();

        val files = trainFileRepository.findByOwnerIndexId(member.id)
        return files.stream().map { file -> modelMapper.map(file, FileDto::class.java) }.toList()
    }

    @Transactional
    override suspend fun deleteTrainData(id: Long) {
        val member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val file = trainFileRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.FILE_NOT_FOUND) }

        if (file.ownerIndex.id != member.id) {
            throw CustomException(ErrorInfo.FILE_NOT_FOUND)
        }

        fileComponent.deleteFile(file)
    }

    override suspend fun requestTrain(): List<FileDto> {
        val member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val files = trainFileRepository.findByOwnerIndexId(member.id)

//        if ()

        return files.stream().map { file -> modelMapper.map(file, FileDto::class.java) }.toList()
    }
}