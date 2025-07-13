package cc.nobrain.dev.userserver.fixture

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import cc.nobrain.dev.userserver.domain.train.repository.ClassfiyRepository
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * TestDataFactory는 테스트에서 사용할 실제 데이터베이스 엔티티를 생성하고 저장하는 팩토리 클래스입니다.
 * Mockito 대신 실제 리포지토리를 사용하여 데이터베이스에 테스트 데이터를 삽입합니다.
 */
@Component
@Transactional
class TestDataFactory {

    @Autowired
    private lateinit var memberRepository: MemberRepository

    @Autowired
    private lateinit var workspaceRepository: WorkspaceRepository

    @Autowired
    private lateinit var trainFileRepository: TrainFileRepository

    @Autowired
    private lateinit var classfiyRepository: ClassfiyRepository

    @Autowired
    private lateinit var noticeRepository: NoticeRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    /**
     * 테스트용 멤버를 생성하고 데이터베이스에 저장합니다.
     */
    fun createTestMember(
        email: String = "test@test.com",
        password: String = "123123!",
        name: String = "Test User",
        isVerified: Boolean = true
    ): Member {
        val member = Member(
            email = email,
            password = passwordEncoder.encode(password),
            name = name
        )
        
        // 필요한 경우 verify() 메서드로 검증 상태 설정
        if (isVerified) {
            member.verify()
        }
        
        return memberRepository.save(member)
    }

    /**
     * 테스트용 워크스페이스를 생성하고 데이터베이스에 저장합니다.
     */
    fun createTestWorkspace(
        name: String = "Test Workspace",
        description: String = "Test workspace description",
        owner: Member? = null
    ): Workspace {
        val workspaceOwner = owner ?: createTestMember()
        val workspace = Workspace(
            name = name,
            description = description,
            owner = workspaceOwner
        )
        
        // Add owner to members list to maintain consistency
        workspace.addMember(workspaceOwner)
        
        return workspaceRepository.save(workspace)
    }

    /**
     * 테스트용 훈련 파일을 생성하고 데이터베이스에 저장합니다.
     */
    fun createTestTrainFile(
        fileName: String = "test_image.jpg",
        originalFileName: String = "test_image.jpg",
        fileExtension: String = "jpg",
        size: Long = 1024L,
        contentType: String = "image/jpeg",
        path: String = "/test/path/test_image.jpg",
        url: String = "http://test.com/test_image.jpg",
        workspace: Workspace? = null,
        label: String = "none"
    ): TrainFile {
        val targetWorkspace = workspace ?: createTestWorkspace()
        val trainFile = TrainFile(
            label = label
        ).apply {
            this.fileName = fileName
            this.originalFileName = originalFileName
            this.fileExtension = fileExtension
            this.size = size
            this.contentType = contentType
            this.path = path
            this.url = url
        }
        
        // Establish bidirectional relationship properly
        trainFile.setRelation(targetWorkspace)
        
        val savedFile = trainFileRepository.save(trainFile)
        // Save workspace to persist the relationship
        workspaceRepository.save(targetWorkspace)
        
        return savedFile
    }

    /**
     * 테스트용 분류 결과를 생성하고 데이터베이스에 저장합니다.
     */
    fun createTestClassification(
        owner: Member? = null,
        classes: MutableList<String> = mutableListOf("cat", "dog"),
        resultJson: String = "{\"results\": [\"cat\", \"dog\"]}"
    ): Classfiy {
        val targetOwner = owner ?: createTestMember()
        val classification = Classfiy(
            owner = targetOwner,
            classes = classes,
            resultJson = resultJson
        )
        return classfiyRepository.save(classification)
    }

    /**
     * 테스트용 공지사항을 생성하고 데이터베이스에 저장합니다.
     */
    fun createTestNotice(
        title: String = "Test Notice",
        content: String = "Test notice content",
        sticky: Boolean = false
    ): Notice {
        val notice = Notice(
            title = title,
            content = content,
            sticky = sticky
        )
        return noticeRepository.save(notice)
    }

    /**
     * 테스트 환경을 정리합니다.
     */
    fun cleanUp() {
        classfiyRepository.deleteAll()
        trainFileRepository.deleteAll()
        workspaceRepository.deleteAll()
        noticeRepository.deleteAll()
        memberRepository.deleteAll()
    }

    /**
     * 완전한 테스트 시나리오를 위한 복합 데이터를 생성합니다.
     */
    fun createCompleteTestScenario(): TestScenario {
        val member = createTestMember()
        val workspace = createTestWorkspace(owner = member)
        val trainFile = createTestTrainFile(workspace = workspace)
        val classification = createTestClassification(owner = member)
        val notice = createTestNotice()

        return TestScenario(
            member = member,
            workspace = workspace,
            trainFile = trainFile,
            classification = classification,
            notice = notice
        )
    }

    /**
     * 테스트 시나리오 데이터를 담는 데이터 클래스
     */
    data class TestScenario(
        val member: Member,
        val workspace: Workspace,
        val trainFile: TrainFile,
        val classification: Classfiy,
        val notice: Notice
    )
}