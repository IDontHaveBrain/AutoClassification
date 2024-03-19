package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.common.component.FileComponent
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import cc.nobrain.dev.userserver.domain.train.service.dto.LabelAndIds
import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.modelmapper.ModelMapper
import org.springframework.http.ResponseEntity
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
    override suspend fun testClassfiyData(data: List<String>, files: Array<MultipartFile>): ResponseEntity<Any> {
        var member = MemberUtil.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        member = memberRepository.findById(member.id)
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val tempFiles = withContext(Dispatchers.IO) {
            fileComponent.uploadTempFiles(files, member)
        }

        val testImages = tempFiles.map { file -> modelMapper.map(file, FileDto::class.java)}
        val testClass = data;

        val requestBody = mapOf(
            "testClass" to testClass,
            "testImages" to testImages
        )

        CoroutineScope(Dispatchers.IO).launch {
            val response: List<LabelAndIds> = webClient.post()
                .uri("http://localhost:5000/api/train")
                .header("x-api-key", "test")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(LabelAndIds::class.java)
                .collectList()
                .block() ?: emptyList()
            println(response);
        }

        return ResponseEntity.ok().build();
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