package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.common.component.FileComponent
import cc.nobrain.dev.userserver.common.component.RabbitEventPublisher
import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.CLASSIFY_QUEUE
import cc.nobrain.dev.userserver.common.config.RabbitMqConfiguration.Companion.TRAIN_QUEUE
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.properties.UrlProps
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.alarm.service.AlarmService
import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import cc.nobrain.dev.userserver.domain.train.entity.TestFile
import cc.nobrain.dev.userserver.domain.train.repository.ClassfiyRepository
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import cc.nobrain.dev.userserver.domain.train.service.dto.ClassfiyRes
import cc.nobrain.dev.userserver.domain.train.service.dto.LabelAndIds
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import cc.nobrain.dev.userserver.domain.workspace.service.WorkspaceService
import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.modelmapper.ModelMapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.reactive.function.client.WebClient

@Service
@Transactional(readOnly = true)
class TrainServiceImpl(
    private val trainFileRepository: TrainFileRepository,
    private val classfiyRepository: ClassfiyRepository,
    private val workspaceRepository: WorkspaceRepository,
    private val fileComponent: FileComponent,
    private val memberRepository: MemberRepository,
    private val modelMapper: ModelMapper,
    private val objectMapper: ObjectMapper,
    private val workspaceService: WorkspaceService,
    private val alarmService: AlarmService,
    private val rabbitEventPublisher: RabbitEventPublisher,
    private val webClient: WebClient,
    private val urlProps: UrlProps
) : TrainService {

    @Transactional
    override suspend fun testClassfiyData(data: List<String>, files: Array<MultipartFile>): ResponseEntity<Any> {
        val member = MemberUtil.instance.getCurrentMemberDto()
            .flatMap { dto -> dto.id?.let { id -> memberRepository.findById(id) } }
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        var classfiy = Classfiy(
            owner = member,
            classes = data.toMutableList()
        )
        classfiy = classfiyRepository.save(classfiy);

        val tempFiles = fileComponent.uploadFile(files, TestFile::class.java, classfiy)

        val testImages = tempFiles.map { file -> modelMapper.map(file, FileDto::class.java)}
        val testClass = data;

        val requestBody = mapOf(
            "testClass" to testClass,
            "testImages" to testImages
        )

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response: List<LabelAndIds> = webClient.post()
                    .uri("${urlProps.ai}/api/testclassify")
                    .header("x-api-key", "test")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToFlux(LabelAndIds::class.java)
                    .collectList()
                    .block(java.time.Duration.ofMinutes(10)) ?: emptyList()
                saveTestResult(classfiy.id!!, response);
                alarmService.sendAlarmToMember(member.id!!, "테스트 결과가 도착했습니다.", "테스트 결과가 도착했습니다.");
            } catch (e: java.util.concurrent.TimeoutException) {
                e.printStackTrace();
                saveTestResult(classfiy.id!!, emptyList());
                alarmService.sendAlarmToMember(member.id!!, "테스트 시간이 초과되었습니다.", "AI 처리 시간이 10분을 초과하여 테스트가 실패하였습니다.");
            } catch (e: org.springframework.web.reactive.function.client.WebClientRequestException) {
                e.printStackTrace();
                saveTestResult(classfiy.id!!, emptyList());
                alarmService.sendAlarmToMember(member.id!!, "AI 서버 연결에 실패하였습니다.", "AI 서버와의 연결이 실패하여 테스트가 중단되었습니다.");
            } catch (e: Exception) {
                e.printStackTrace();
                saveTestResult(classfiy.id!!, emptyList());
                alarmService.sendAlarmToMember(member.id!!, "테스트가 실패하였습니다.", "예상치 못한 오류로 인해 테스트가 실패하였습니다: ${e.message}");
            }
        }

        return ResponseEntity.ok().build();
    }

    @EntityGraph(attributePaths = ["testFiles"])
    override suspend fun getTestResultList(page: Pageable): Page<ClassfiyRes> {
        val spec = ClassfiySpecs.ownerId(MemberUtil.instance.getCurrentMemberDto().get().id)
        val classfiy = classfiyRepository.findAll(spec, page)
        return classfiy.map { c -> modelMapper.map(c, ClassfiyRes::class.java)};
    }

    override suspend fun getMyImgs(): List<FileDto> {
        val member = MemberUtil.instance.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val workspaces = workspaceService.getMyWorkspace(null, null);

        val files = trainFileRepository.findByOwnerIndex_Id(member.id!!)
        return files.stream().map { file -> modelMapper.map(file, FileDto::class.java) }.toList()
    }

    @Transactional
    override suspend fun deleteTrainData(id: Long) {
        val member = MemberUtil.instance.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val file = trainFileRepository.findById(id)
            .orElseThrow { CustomException(ErrorInfo.FILE_NOT_FOUND) }

        if (file.ownerIndex!!.id != member.id) {
            throw CustomException(ErrorInfo.FILE_NOT_FOUND)
        }

        fileComponent.deleteFile(file)
    }

    @Transactional
    override suspend fun requestLabeling(workspaceId: Long): ResponseEntity<Any> {
        val member = MemberUtil.instance.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }
        val workspaceList = workspaceService.getMyWorkspace(null, null);
        val workspace = workspaceList.stream().filter { w -> w.id == workspaceId }.findFirst()
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val files = trainFileRepository.findByOwnerIndex_Id(workspaceId);

        val testImages = files.map { file -> modelMapper.map(file, FileDto::class.java)}
        val testClass = workspace.classes;

        val requestBody = mapOf(
            "requesterId" to member.id,
            "workspaceId" to workspace.id,
            "testClass" to testClass,
            "testImages" to testImages
        )

        rabbitEventPublisher.publish(CLASSIFY_QUEUE, objectMapper.writeValueAsString(requestBody));

        return ResponseEntity.ok().build();
    }

    @Transactional
    @EntityGraph(attributePaths = ["files"])
    override suspend fun requestTrain(workspaceId: Long): ResponseEntity<Any> {
        val member = MemberUtil.instance.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow { CustomException(ErrorInfo.WORKSPACE_NOT_FOUND) }

        val validFiles = workspace.files.filter { it.label != null && it.label != "none" }

        if (validFiles.size >= 20) {
            val requestBody = mapOf(
                "requesterId" to member.id,
                "workspaceId" to workspace.id,
                "classes" to workspace.classes
            )

            val queueStatus = rabbitEventPublisher.getQueueStatus(TRAIN_QUEUE)
            if (queueStatus.messageCount >= 5) {
                throw CustomException(ErrorInfo.TRAIN_QUEUE_FULL)
            }

            rabbitEventPublisher.publish(TRAIN_QUEUE, objectMapper.writeValueAsString(requestBody))
            return ResponseEntity.ok().build()
        } else {
            throw CustomException(ErrorInfo.INSUFFICIENT_LABELED_DATA)
        }
    }

    @Transactional
    override suspend fun updateFileLabels(response: List<LabelAndIds>) {
        val fileIds = response.flatMap { it.ids }.toSet()
        val files = trainFileRepository.findAllById(fileIds)

        files.forEach { file ->
            val label = response.find { it.ids.contains(file.id) }?.label
            if (label != null) {
                file.label = label
            }
        }

        trainFileRepository.saveAll(files)
    }

    @Transactional
    protected suspend fun saveTestResult(classfiyId: Long, rst: List<LabelAndIds>) {
        val classfiy = classfiyRepository.findById(classfiyId)
            .orElseThrow { CustomException(ErrorInfo.TARGET_NOT_FOUND) }

        classfiy.resultJson = objectMapper.writeValueAsString(rst);
        classfiyRepository.save(classfiy);
    }
}
