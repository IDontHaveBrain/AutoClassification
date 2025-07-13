package cc.nobrain.dev.userserver.common

import cc.nobrain.dev.userserver.UserServerApplication
import cc.nobrain.dev.userserver.fixture.TestDataFactory
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import cc.nobrain.dev.userserver.domain.train.repository.ClassfiyRepository
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository
import cc.nobrain.dev.userserver.common.component.RsaHelper
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.AfterEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.annotation.DirtiesContext
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType

/**
 * BaseIntegrationTest는 H2 인메모리 데이터베이스를 사용한 통합 테스트를 위한 추상 베이스 클래스입니다.
 * 
 * 주요 기능:
 * - H2 데이터베이스를 사용한 테스트 환경 구성
 * - 자동 트랜잭션 관리 및 롤백
 * - 테스트 데이터 생성 및 정리 유틸리티
 * - MockMvc 및 TestRestTemplate 설정
 * - 공통 테스트 헬퍼 메서드 제공
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = [
        "spring.profiles.active=test",
        "spring.jpa.show-sql=false", // 테스트 로그 간소화
        "logging.level.org.hibernate.SQL=warn",
        "logging.level.org.hibernate.type.descriptor.sql.BasicBinder=warn",
        "management.health.mail.enabled=false" // 메일 헬스 체크 비활성화 (MockBean 충돌 방지)
    ],
    classes = [UserServerApplication::class, TestSecurityConfig::class]
)
@ActiveProfiles("test")
@Transactional
// 성능 최적화: 컨텍스트 재생성을 클래스 수준으로 변경 (AFTER_EACH_TEST_METHOD → AFTER_CLASS)
// @Transactional과 수동 데이터 정리로 테스트 격리 보장
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
abstract class BaseIntegrationTest {

    @LocalServerPort
    protected var port: Int = 0

    @Autowired
    protected lateinit var testRestTemplate: TestRestTemplate

    @Autowired
    protected lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    protected lateinit var objectMapper: ObjectMapper

    @Autowired
    protected lateinit var testDataFactory: TestDataFactory

    // 리포지토리들 - 테스트 데이터 확인 및 검증용
    @Autowired
    protected lateinit var memberRepository: MemberRepository

    @Autowired
    protected lateinit var workspaceRepository: WorkspaceRepository

    @Autowired
    protected lateinit var trainFileRepository: TrainFileRepository

    @Autowired
    protected lateinit var classfiyRepository: ClassfiyRepository

    @Autowired
    protected lateinit var noticeRepository: NoticeRepository

    @Autowired
    protected lateinit var rsaHelper: RsaHelper

    // MockMvc 설정 - 컨트롤러 테스트용
    protected lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        // MockMvc 설정 (Spring Security와 함께)
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()

        // 테스트 시작 전 데이터 정리
        cleanupTestData()
        
        // Mock 멤버 레지스트리 정리
        WithMockMemberSecurityContextFactory.clearRegistry()
    }

    @AfterEach
    fun tearDown() {
        // 테스트 완료 후 데이터 정리 (트랜잭션 롤백과 함께 이중 보장)
        cleanupTestData()
        
        // Mock 멤버 레지스트리 정리
        WithMockMemberSecurityContextFactory.clearRegistry()
    }

    /**
     * 테스트 데이터를 정리합니다.
     * 외래 키 제약조건을 고려하여 순서대로 정리합니다.
     */
    protected fun cleanupTestData() {
        try {
            // 분류 및 훈련 파일 정리
            classfiyRepository.deleteAll()
            trainFileRepository.deleteAll()
            
            // 워크스페이스 정리
            workspaceRepository.deleteAll()
            
            // 공지사항 정리
            noticeRepository.deleteAll()
            
            // 멤버 정리 (마지막에 정리)
            memberRepository.deleteAll()
        } catch (e: Exception) {
            // 정리 중 오류 발생 시 테스트는 계속 진행
        }
    }

    /**
     * 기본 페이징 설정을 생성합니다.
     */
    protected fun createDefaultPageable(
        page: Int = 0,
        size: Int = 10,
        sortBy: String = "id",
        direction: Sort.Direction = Sort.Direction.ASC
    ): Pageable {
        return PageRequest.of(page, size, Sort.by(direction, sortBy))
    }

    /**
     * 베이스 URL을 생성합니다.
     */
    protected fun createUrl(path: String): String {
        return "http://localhost:$port$path"
    }

    /**
     * HTTP GET 요청을 수행합니다.
     */
    protected fun performGet(
        path: String,
        headers: HttpHeaders = HttpHeaders()
    ): org.springframework.http.ResponseEntity<String> {
        headers.contentType = MediaType.APPLICATION_JSON
        val httpEntity = org.springframework.http.HttpEntity(null, headers)
        return testRestTemplate.exchange(
            createUrl(path),
            org.springframework.http.HttpMethod.GET,
            httpEntity,
            String::class.java
        )
    }

    /**
     * HTTP POST 요청을 수행합니다.
     */
    protected fun performPost(
        path: String,
        body: Any? = null,
        headers: HttpHeaders = HttpHeaders()
    ): org.springframework.http.ResponseEntity<String> {
        headers.contentType = MediaType.APPLICATION_JSON
        val jsonBody = body?.let { objectMapper.writeValueAsString(it) }
        val httpEntity = org.springframework.http.HttpEntity(jsonBody, headers)
        return testRestTemplate.exchange(
            createUrl(path),
            org.springframework.http.HttpMethod.POST,
            httpEntity,
            String::class.java
        )
    }

    /**
     * HTTP PUT 요청을 수행합니다.
     */
    protected fun performPut(
        path: String,
        body: Any? = null,
        headers: HttpHeaders = HttpHeaders()
    ): org.springframework.http.ResponseEntity<String> {
        headers.contentType = MediaType.APPLICATION_JSON
        val jsonBody = body?.let { objectMapper.writeValueAsString(it) }
        val httpEntity = org.springframework.http.HttpEntity(jsonBody, headers)
        return testRestTemplate.exchange(
            createUrl(path),
            org.springframework.http.HttpMethod.PUT,
            httpEntity,
            String::class.java
        )
    }

    /**
     * HTTP DELETE 요청을 수행합니다.
     */
    protected fun performDelete(
        path: String,
        headers: HttpHeaders = HttpHeaders()
    ): org.springframework.http.ResponseEntity<String> {
        headers.contentType = MediaType.APPLICATION_JSON
        val httpEntity = org.springframework.http.HttpEntity(null, headers)
        return testRestTemplate.exchange(
            createUrl(path),
            org.springframework.http.HttpMethod.DELETE,
            httpEntity,
            String::class.java
        )
    }

    /**
     * JWT 토큰을 헤더에 추가합니다.
     */
    protected fun createAuthHeaders(token: String): HttpHeaders {
        val headers = HttpHeaders()
        headers.setBearerAuth(token)
        headers.contentType = MediaType.APPLICATION_JSON
        return headers
    }

    /**
     * JSON 응답을 파싱합니다.
     */
    protected fun <T> parseResponse(response: String, clazz: Class<T>): T {
        return objectMapper.readValue(response, clazz)
    }

    /**
     * 응답 본문에서 특정 필드 값을 추출합니다.
     */
    protected fun extractFieldFromResponse(response: String, fieldName: String): String? {
        return try {
            val jsonNode = objectMapper.readTree(response)
            jsonNode.get(fieldName)?.asText()
        } catch (e: Exception) {
            null
        }
    }

    /**
     * 데이터베이스에 데이터가 존재하는지 확인합니다.
     */
    protected fun verifyMemberExists(email: String): Boolean {
        return memberRepository.findByEmail(email) != null
    }

    protected fun verifyWorkspaceExists(name: String): Boolean {
        return workspaceRepository.findAll().any { it.name == name }
    }

    /**
     * 테스트용 완전한 시나리오 데이터를 생성합니다.
     */
    protected fun createCompleteTestScenario(): TestDataFactory.TestScenario {
        return testDataFactory.createCompleteTestScenario()
    }

    /**
     * 특정 개수의 테스트 멤버들을 생성합니다.
     */
    protected fun createTestMembers(count: Int): List<cc.nobrain.dev.userserver.domain.member.entity.Member> {
        return (1..count).map { index ->
            testDataFactory.createTestMember(
                email = "test$index@test.com",
                name = "Test User $index"
            )
        }
    }

    /**
     * 특정 개수의 테스트 워크스페이스들을 생성합니다.
     */
    protected fun createTestWorkspaces(
        count: Int,
        owner: cc.nobrain.dev.userserver.domain.member.entity.Member? = null
    ): List<cc.nobrain.dev.userserver.domain.workspace.entity.Workspace> {
        val workspaceOwner = owner ?: testDataFactory.createTestMember()
        return (1..count).map { index ->
            testDataFactory.createTestWorkspace(
                name = "Test Workspace $index",
                description = "Test workspace $index description",
                owner = workspaceOwner
            )
        }
    }

    /**
     * 응답 상태 코드를 검증합니다.
     */
    protected fun assertResponseStatus(
        response: org.springframework.http.ResponseEntity<String>,
        expectedStatus: org.springframework.http.HttpStatus
    ) {
        assert(response.statusCode == expectedStatus) {
            "Expected status $expectedStatus but got ${response.statusCode}. Response body: ${response.body}"
        }
    }

    /**
     * 응답 본문이 비어있지 않은지 검증합니다.
     */
    protected fun assertResponseNotEmpty(response: org.springframework.http.ResponseEntity<String>) {
        assert(!response.body.isNullOrBlank()) {
            "Response body should not be empty"
        }
    }

    /**
     * JSON 응답에서 특정 필드가 존재하는지 검증합니다.
     */
    protected fun assertJsonFieldExists(response: String, fieldName: String) {
        val jsonNode = objectMapper.readTree(response)
        assert(jsonNode.has(fieldName)) {
            "JSON response should contain field '$fieldName'. Response: $response"
        }
    }

    /**
     * JSON 응답에서 배열의 크기를 검증합니다.
     */
    protected fun assertJsonArraySize(response: String, arrayFieldName: String, expectedSize: Int) {
        val jsonNode = objectMapper.readTree(response)
        val arrayNode = jsonNode.get(arrayFieldName)
        assert(arrayNode?.isArray == true) {
            "Field '$arrayFieldName' should be an array. Response: $response"
        }
        assert(arrayNode.size() == expectedSize) {
            "Array '$arrayFieldName' should have size $expectedSize but has ${arrayNode.size()}. Response: $response"
        }
    }

    /**
     * OAuth2 인증을 위한 비밀번호 RSA 암호화
     */
    protected fun encryptPassword(plainPassword: String): String {
        return rsaHelper.encrypt(plainPassword)
    }

    /**
     * 데이터베이스 멤버를 Mock 보안 컨텍스트와 동기화합니다.
     * @WithMockMember 사용 시 데이터베이스 멤버와 Mock 멤버를 동기화하기 위해 사용
     */
    protected fun registerMemberForMockContext(member: cc.nobrain.dev.userserver.domain.member.entity.Member) {
        WithMockMemberSecurityContextFactory.registerMember(member.email, member)
    }

    /**
     * 테스트 멤버를 생성하고 Mock 보안 컨텍스트에 자동 등록합니다.
     */
    protected fun createAndRegisterTestMember(
        email: String = "test@test.com",
        password: String = "123123!",
        name: String = "Test User",
        isVerified: Boolean = true
    ): cc.nobrain.dev.userserver.domain.member.entity.Member {
        val member = testDataFactory.createTestMember(
            email = email,
            password = password,
            name = name,
            isVerified = isVerified
        )
        registerMemberForMockContext(member)
        return member
    }
}