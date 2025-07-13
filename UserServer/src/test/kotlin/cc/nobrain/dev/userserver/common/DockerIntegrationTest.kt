package cc.nobrain.dev.userserver.common

import cc.nobrain.dev.userserver.fixture.TestDataFactory
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.workspace.repository.WorkspaceRepository
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import cc.nobrain.dev.userserver.domain.train.repository.ClassfiyRepository
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Tag
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.RabbitMQContainer
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Duration

/**
 * DockerIntegrationTest는 TestContainers를 사용한 Docker 기반 통합 테스트를 위한 추상 베이스 클래스입니다.
 * 
 * 주요 기능:
 * - PostgreSQL, Redis, RabbitMQ Docker 컨테이너를 사용한 실제 환경과 유사한 테스트 환경 구성
 * - TestContainers 라이프사이클 관리 (컨테이너 시작/정지)
 * - 테스트 데이터 생성 및 정리 유틸리티
 * - MockMvc 및 TestRestTemplate 설정
 * - 공통 테스트 헬퍼 메서드 제공
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = [
        "spring.profiles.active=docker",
        "spring.jpa.show-sql=false", // 테스트 로그 간소화
        "logging.level.org.hibernate.SQL=warn",
        "logging.level.org.hibernate.type.descriptor.sql.BasicBinder=warn",
        "spring.jpa.hibernate.ddl-auto=create-drop", // Docker 환경에서는 create-drop 사용
        "spring.datasource.hikari.maximum-pool-size=5", // 테스트용 풀 크기 조정
        "spring.datasource.hikari.minimum-idle=2"
    ]
)
@ActiveProfiles("docker")
@Testcontainers
@Tag("docker")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
abstract class DockerIntegrationTest {

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

    // MockMvc 설정 - 컨트롤러 테스트용
    protected lateinit var mockMvc: MockMvc

    companion object {
        /**
         * PostgreSQL 컨테이너 설정
         * - 포트: 5432 (내부), 동적 포트 할당 (외부)
         * - 데이터베이스: postgres
         * - 사용자: jnj / 패스워드: sqisoft (dev 환경과 동일)
         */
        @Container
        @JvmStatic
        val postgreSQLContainer: PostgreSQLContainer<*> = PostgreSQLContainer("postgres:16-alpine")
            .withDatabaseName("postgres")
            .withUsername("jnj")
            .withPassword("sqisoft")
            .withInitScript("init-test-db.sql") // 필요시 초기화 스크립트 추가
            .waitingFor(Wait.forListeningPort())
            .withStartupTimeout(Duration.ofMinutes(3))

        /**
         * Redis 컨테이너 설정
         * - 포트: 6379 (내부), 동적 포트 할당 (외부)
         * - 기본 Redis 설정 사용
         */
        @Container
        @JvmStatic
        val redisContainer: GenericContainer<*> = GenericContainer("redis:7-alpine")
            .withExposedPorts(6379)
            .waitingFor(Wait.forListeningPort())
            .withStartupTimeout(Duration.ofMinutes(2))

        /**
         * RabbitMQ 컨테이너 설정
         * - 포트: 5672 (AMQP), 15672 (Management UI)
         * - 사용자: guest / 패스워드: guest (기본값)
         */
        @Container
        @JvmStatic
        val rabbitMQContainer: RabbitMQContainer = RabbitMQContainer("rabbitmq:3.12-management-alpine")
            .withUser("guest", "guest")
            .waitingFor(Wait.forLogMessage(".*Server startup complete.*", 1))
            .withStartupTimeout(Duration.ofMinutes(3))

        /**
         * Spring Boot 애플리케이션 속성을 동적으로 설정합니다.
         * TestContainers에서 할당된 포트를 사용하여 연결 정보를 구성합니다.
         */
        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            // PostgreSQL 연결 설정
            registry.add("spring.datasource.url") { 
                "jdbc:postgresql://localhost:${postgreSQLContainer.getMappedPort(5432)}/postgres"
            }
            registry.add("spring.datasource.username") { postgreSQLContainer.username }
            registry.add("spring.datasource.password") { postgreSQLContainer.password }
            registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }

            // Redis 연결 설정
            registry.add("spring.data.redis.host") { "localhost" }
            registry.add("spring.data.redis.port") { redisContainer.getMappedPort(6379) }
            registry.add("spring.data.redis.timeout") { "5000" }

            // RabbitMQ 연결 설정
            registry.add("spring.rabbitmq.host") { "localhost" }
            registry.add("spring.rabbitmq.port") { rabbitMQContainer.getMappedPort(5672) }
            registry.add("spring.rabbitmq.username") { "guest" }
            registry.add("spring.rabbitmq.password") { "guest" }
            
            // 테스트용 스토리지 경로 설정
            registry.add("app.storage.path") { System.getProperty("java.io.tmpdir") + "/test-storage/" }
            registry.add("spring.web.resources.static-locations") { 
                "file:" + System.getProperty("java.io.tmpdir") + "/test-storage/"
            }
        }

        @BeforeAll
        @JvmStatic
        fun setUpContainers() {
            // 컨테이너들이 시작되었는지 확인
            println("=== Docker 컨테이너 상태 ===")
            println("PostgreSQL: ${if (postgreSQLContainer.isRunning) "실행중" else "중지됨"} " +
                    "- 포트: ${postgreSQLContainer.getMappedPort(5432)}")
            println("Redis: ${if (redisContainer.isRunning) "실행중" else "중지됨"} " +
                    "- 포트: ${redisContainer.getMappedPort(6379)}")
            println("RabbitMQ: ${if (rabbitMQContainer.isRunning) "실행중" else "중지됨"} " +
                    "- AMQP 포트: ${rabbitMQContainer.getMappedPort(5672)}, " +
                    "관리 포트: ${rabbitMQContainer.getMappedPort(15672)}")
            println("===============================")
        }

        @AfterAll
        @JvmStatic
        fun tearDownContainers() {
            // TestContainers가 자동으로 정리하지만, 명시적으로 정리할 수도 있음
            println("=== Docker 컨테이너 정리 ===")
            
            try {
                if (rabbitMQContainer.isRunning) {
                    rabbitMQContainer.stop()
                }
                if (redisContainer.isRunning) {
                    redisContainer.stop()
                }
                if (postgreSQLContainer.isRunning) {
                    postgreSQLContainer.stop()
                }
            } catch (e: Exception) {
                println("경고: 컨테이너 정리 중 오류 발생: ${e.message}")
            }
            
            println("=============================")
        }
    }

    @BeforeEach
    fun setUp() {
        // MockMvc 설정 (Spring Security와 함께)
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()

        // 테스트 시작 전 데이터 정리
        cleanupTestData()
        
        // 테스트용 스토리지 디렉토리 생성
        createTestStorageDirectory()
    }

    @AfterEach
    fun tearDown() {
        // 테스트 완료 후 데이터 정리
        cleanupTestData()
        
        // 테스트용 파일 정리
        cleanupTestStorageDirectory()
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
            // 정리 중 오류 발생 시 로그 출력하지만 테스트는 계속 진행
            println("경고: 테스트 데이터 정리 중 오류 발생: ${e.message}")
        }
    }

    /**
     * 테스트용 스토리지 디렉토리를 생성합니다.
     */
    private fun createTestStorageDirectory() {
        try {
            val storageDir = java.io.File(System.getProperty("java.io.tmpdir") + "/test-storage/")
            if (!storageDir.exists()) {
                storageDir.mkdirs()
            }
        } catch (e: Exception) {
            println("경고: 테스트 스토리지 디렉토리 생성 중 오류 발생: ${e.message}")
        }
    }

    /**
     * 테스트용 스토리지 디렉토리를 정리합니다.
     */
    private fun cleanupTestStorageDirectory() {
        try {
            val storageDir = java.io.File(System.getProperty("java.io.tmpdir") + "/test-storage/")
            if (storageDir.exists()) {
                storageDir.deleteRecursively()
            }
        } catch (e: Exception) {
            println("경고: 테스트 스토리지 디렉토리 정리 중 오류 발생: ${e.message}")
        }
    }

    /**
     * 컨테이너 상태를 확인합니다.
     */
    protected fun verifyContainerStatus() {
        assert(postgreSQLContainer.isRunning) { "PostgreSQL 컨테이너가 실행 중이어야 합니다" }
        assert(redisContainer.isRunning) { "Redis 컨테이너가 실행 중이어야 합니다" }
        assert(rabbitMQContainer.isRunning) { "RabbitMQ 컨테이너가 실행 중이어야 합니다" }
    }

    /**
     * 데이터베이스 연결 상태를 확인합니다.
     */
    protected fun verifyDatabaseConnection(): Boolean {
        return try {
            memberRepository.count() >= 0
            true
        } catch (e: Exception) {
            false
        }
    }

    // BaseIntegrationTest와 동일한 유틸리티 메서드들

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
            "Expected status $expectedStatus but received ${response.statusCode}. Response body: ${response.body}"
        }
    }

    /**
     * 응답 본문이 비어있지 않은지 검증합니다.
     */
    protected fun assertResponseNotEmpty(response: org.springframework.http.ResponseEntity<String>) {
        assert(!response.body.isNullOrBlank()) {
            "응답 본문이 비어있지 않아야 합니다"
        }
    }

    /**
     * JSON 응답에서 특정 필드가 존재하는지 검증합니다.
     */
    protected fun assertJsonFieldExists(response: String, fieldName: String) {
        val jsonNode = objectMapper.readTree(response)
        assert(jsonNode.has(fieldName)) {
            "JSON 응답에 '$fieldName' 필드가 포함되어야 합니다. 응답: $response"
        }
    }

    /**
     * JSON 응답에서 배열의 크기를 검증합니다.
     */
    protected fun assertJsonArraySize(response: String, arrayFieldName: String, expectedSize: Int) {
        val jsonNode = objectMapper.readTree(response)
        val arrayNode = jsonNode.get(arrayFieldName)
        assert(arrayNode?.isArray == true) {
            "'$arrayFieldName' 필드는 배열이어야 합니다. 응답: $response"
        }
        assert(arrayNode.size() == expectedSize) {
            "Array '$arrayFieldName' should have size $expectedSize but has ${arrayNode.size()}. Response: $response"
        }
    }

    /**
     * Docker 컨테이너 정보를 출력합니다 (디버깅용).
     */
    protected fun printContainerInfo() {
        println("=== 컨테이너 정보 ===")
        println("PostgreSQL JDBC URL: jdbc:postgresql://localhost:${postgreSQLContainer.getMappedPort(5432)}/postgres")
        println("Redis URL: redis://localhost:${redisContainer.getMappedPort(6379)}")
        println("RabbitMQ URL: amqp://guest:guest@localhost:${rabbitMQContainer.getMappedPort(5672)}")
        println("RabbitMQ Management: http://localhost:${rabbitMQContainer.getMappedPort(15672)}")
        println("=========================")
    }
}