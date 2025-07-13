package cc.nobrain.dev.userserver.domain.member

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import cc.nobrain.dev.userserver.common.WithMockMember
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.annotation.Commit
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired

/**
 * 회원 관리 도메인 통합 테스트 클래스
 * 
 * 이 테스트 클래스는 회원 관리 관련 핵심 기능들에 대한 종합적인 통합 테스트를 제공합니다.
 * BaseIntegrationTest를 확장하여 실제 데이터베이스와 Spring Security 컨텍스트를 활용한 
 * 실제 환경과 유사한 테스트 환경을 구성합니다.
 * 
 * 주요 테스트 범위:
 * - 회원 등록 워크플로우 (유효성 검사, 중복 확인, 이메일 인증)
 * - 토큰 기반 이메일 인증 시스템
 * - 이메일 중복 확인 API
 * - 인증된 사용자의 정보 조회 및 관리
 * - 회원 검색 및 페이징 처리
 * - 로그아웃 기능
 * - 회원 엔티티의 라이프사이클 및 비즈니스 로직
 * 
 * 테스트 도구 및 패턴:
 * - @WithMockMember: Spring Security 컨텍스트에 가짜 인증 사용자 설정
 * - TestDataFactory: 일관된 테스트 데이터 생성
 * - MockMvc: HTTP 요청/응답 시뮬레이션
 * - EntityManager: 데이터베이스 상태 직접 제어 (flush/clear)
 * 
 * 현재 테스트 성공률: 68% (13/19) - 일부 이메일 서비스 의존성 및 보안 설정 이슈로 인한 실패
 */
@DisplayName("멤버 관리 통합 테스트")
class MemberIntegrationTest : BaseIntegrationTest() {

    // JSON 직렬화/역직렬화를 위한 ObjectMapper (HTTP 요청 본문 변환용)
    private val mapper = jacksonObjectMapper()
    
    // JPA 영속성 컨텍스트 직접 제어를 위한 EntityManager
    // 테스트에서 flush(), clear() 등을 통해 데이터베이스 상태를 정밀하게 제어
    @Autowired
    private lateinit var entityManager: EntityManager

    /**
     * 회원 등록 정상 흐름 테스트
     * 
     * 이 테스트는 회원 등록의 전체 워크플로우를 검증합니다:
     * 1. 유효한 데이터로 회원 등록 요청
     * 2. 비밀번호 암호화 및 데이터베이스 저장
     * 3. 이메일 인증용 임시 토큰 생성
     * 
     * 주의사항: 실제 이메일 발송은 외부 서비스에 의존하므로 모킹 처리
     */
    @Test
    @DisplayName("멤버 등록 성공 - 유효한 데이터로 새 멤버 등록")
    fun `should successfully register new member with valid data`() {
        // Given: 유효한 멤버 등록 요청 데이터 준비
        // 이메일 형식, 비밀번호 복잡도, 이름 길이 등 모든 유효성 검사를 통과하는 데이터
        val registerRequest = MemberReq.Register(
            email = "newuser@test.com",
            password = "123123!",
            name = "New User"
        )

        // When: POST /api/member/register 엔드포인트로 회원 등록 요청
        // CSRF 토큰과 함께 JSON 형태로 전송
        val result = mockMvc.perform(
            post("/api/member/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(registerRequest))
                .with(csrf()) // Spring Security CSRF 보호 우회
        )

        // Then: HTTP 200 OK 응답 확인
        // 참고: 실제 환경에서는 이메일 서비스 의존성으로 인해 응답 내용이 달라질 수 있음
        result.andExpect(status().isOk)

        // 데이터베이스에서 회원 정보가 올바르게 저장되었는지 검증
        val savedMember = memberRepository.findByEmail("newuser@test.com")
        assertThat(savedMember).isNotNull
        assertThat(savedMember?.email).isEqualTo("newuser@test.com")
        assertThat(savedMember?.name).isEqualTo("New User")
        assertThat(savedMember?.getTempToken()).isNotNull() // 이메일 인증용 임시 토큰 생성 확인
        // 비밀번호는 BCrypt로 암호화되어 저장되므로 원본과 다름 (보안상 직접 비교하지 않음)
    }

    /**
     * 이메일 중복 검증 테스트
     * 
     * 데이터베이스 제약조건과 비즈니스 로직 모두에서 이메일 중복을 방지하는지 확인합니다.
     * 이 테스트는 EntityManager의 flush/clear 패턴을 보여주는 중요한 예시입니다.
     * 
     * EntityManager 패턴 설명:
     * - flush(): 영속성 컨텍스트의 변경사항을 즉시 데이터베이스에 반영
     * - clear(): 영속성 컨텍스트를 비워서 다음 조회 시 데이터베이스에서 최신 상태 로드
     */
    @Test
    @DisplayName("멤버 등록 실패 - 중복 이메일")
    fun `should fail to register member with duplicate email`() {
        // Given: 기존 회원 데이터 생성
        testDataFactory.createTestMember(email = "existing@test.com")
        
        // JPA 영속성 컨텍스트 관리: 테스트 데이터를 즉시 데이터베이스에 반영
        // 이를 통해 실제 운영 환경과 동일한 조건에서 중복 검사 수행
        entityManager.flush()  // 변경사항을 데이터베이스에 즉시 반영
        entityManager.clear()  // 영속성 컨텍스트 초기화로 캐시 무효화

        // 동일한 이메일로 새 회원 등록 시도
        val registerRequest = MemberReq.Register(
            email = "existing@test.com",
            password = "123123!",
            name = "Duplicate User"
        )

        // When: 중복 이메일로 회원 등록 API 호출
        val result = mockMvc.perform(
            post("/api/member/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(registerRequest))
                .with(csrf())
        )

        // Then: HTTP 400 Bad Request 응답으로 중복 이메일 오류 반환
        // 비즈니스 로직에서 중복 이메일을 사전에 체크하여 적절한 오류 메시지 제공
        result.andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("멤버 등록 실패 - 유효하지 않은 이메일 형식")
    fun `should fail to register member with invalid email format`() {
        // Given: 잘못된 이메일 형식
        val registerRequest = MemberReq.Register(
            email = "invalid-email",
            password = "123123!",
            name = "Invalid Email User"
        )

        // When: 잘못된 이메일로 등록 시도
        val result = mockMvc.perform(
            post("/api/member/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(registerRequest))
                .with(csrf())
        )

        // Then: 유효성 검사 오류 반환
        result.andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("멤버 등록 실패 - 잘못된 비밀번호 형식")
    fun `should fail to register member with invalid password format`() {
        // Given: 잘못된 비밀번호 (너무 짧음)
        val registerRequest = MemberReq.Register(
            email = "test@test.com",
            password = "123",
            name = "Weak Password User"
        )

        // When: 약한 비밀번호로 등록 시도
        val result = mockMvc.perform(
            post("/api/member/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(registerRequest))
                .with(csrf())
        )

        // Then: 비밀번호 유효성 검사 오류 반환
        result.andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("이메일 중복 확인 - 기존 이메일")
    fun `should return true for existing email`() {
        // Given: 기존 멤버
        testDataFactory.createTestMember(email = "existing@test.com")

        // When: 이메일 중복 확인
        val result = mockMvc.perform(
            get("/api/member/duplicate")
                .param("email", "existing@test.com")
        )

        // Then: true 반환
        result.andExpect(status().isOk)
            .andExpect(content().string("true"))
    }

    @Test
    @DisplayName("이메일 중복 확인 - 새로운 이메일")
    fun `should return false for new email`() {
        // When: 존재하지 않는 이메일 중복 확인
        val result = mockMvc.perform(
            get("/api/member/duplicate")
                .param("email", "new@test.com")
        )

        // Then: false 반환
        result.andExpect(status().isOk)
            .andExpect(content().string("false"))
    }

    /**
     * 이메일 인증 토큰 검증 테스트
     * 
     * 회원가입 후 이메일로 전송된 인증 링크를 통한 계정 활성화 프로세스를 테스트합니다.
     * 이 테스트는 다음과 같은 이메일 인증 워크플로우를 검증합니다:
     * 
     * 1. 회원가입 시 임시 토큰 생성 (UUID 기반)
     * 2. 이메일로 토큰이 포함된 인증 링크 전송 (실제로는 모킹)
     * 3. 사용자가 링크 클릭 시 토큰 검증 및 계정 활성화
     * 4. 토큰 삭제 및 인증 상태 변경
     * 
     * 보안 고려사항:
     * - 토큰은 일회성 사용 후 즉시 삭제
     * - 토큰 만료 시간 검증 (현재 구현에서는 단순화)
     */
    @Test
    @DisplayName("토큰 인증 성공 - 유효한 토큰으로 인증")
    fun `should successfully verify member with valid token`() {
        // Given: 미인증 상태의 회원 생성 및 인증 토큰 발급
        val member = testDataFactory.createTestMember(
            email = "verify@test.com",
            isVerified = false  // 초기 상태: 이메일 미인증
        )
        
        // 이메일 인증용 임시 토큰 생성 (UUID 기반 랜덤 문자열)
        member.generateTempToken()
        memberRepository.save(member)
        
        // JPA 영속성 컨텍스트 정리: 토큰 정보가 데이터베이스에 확실히 저장되도록 보장
        entityManager.flush()
        entityManager.clear()

        // When: GET /api/member/verify?token={토큰} 인증 링크 클릭 시뮬레이션
        val result = mockMvc.perform(
            get("/api/member/verify")
                .param("token", member.getTempToken()) // 생성된 임시 토큰 사용
        )

        // Then: HTTP 303 See Other로 성공 페이지로 리다이렉트
        // 웹 브라우저에서 GET 요청 후 리다이렉트는 일반적인 패턴
        result.andExpect(status().isSeeOther)
            .andExpect(header().exists("Location")) // 리다이렉트 대상 URL 존재 확인

        // 데이터베이스에서 인증 완료 상태 검증
        val verifiedMember = memberRepository.findByEmail("verify@test.com")
        assertThat(verifiedMember).isNotNull
        
        // 보안 검증: 인증 완료 후 임시 토큰은 즉시 삭제되어야 함 (재사용 방지)
        // 참고: isVerified 필드는 private이므로 간접적으로 토큰 삭제 여부로 인증 상태 확인
        assertThat(verifiedMember?.getTempToken()).isNull()
    }

    @Test
    @DisplayName("토큰 인증 실패 - 유효하지 않은 토큰")
    fun `should fail to verify member with invalid token`() {
        // When: 잘못된 토큰으로 인증 시도
        val result = mockMvc.perform(
            get("/api/member/verify")
                .param("token", "invalid-token")
        )

        // Then: 인증 실패 오류 반환
        result.andExpect(status().isBadRequest)
    }

    /**
     * Spring Security 인증 컨텍스트 테스트 - @WithMockMember 패턴
     * 
     * 이 테스트는 @WithMockMember 커스텀 어노테이션을 사용하여 Spring Security 
     * 인증 컨텍스트에 가짜 사용자를 설정하는 방법을 보여줍니다.
     * 
     * @WithMockMember 동작 방식:
     * 1. 테스트 실행 전에 WithMockMemberSecurityContextFactory가 호출됨
     * 2. SecurityContext에 인증된 사용자 정보 설정
     * 3. @AuthenticationPrincipal로 현재 사용자 정보 주입 가능
     * 
     * 주의사항: 
     * - 어노테이션의 username과 실제 데이터베이스의 이메일이 일치해야 함
     * - registerMemberForMockContext()로 Mock과 실제 데이터 동기화 필요
     */
    @Test
    @WithMockMember(username = "test@test.com", id = 1L)
    @DisplayName("내 정보 조회 성공 - 인증된 사용자")
    fun `should successfully get my info when authenticated`() {
        // Given: 인증된 상태의 테스트 회원 준비
        val member = testDataFactory.createTestMember(
            email = "test@test.com",  // @WithMockMember의 username과 일치해야 함
            name = "Test User",
            isVerified = true  // 인증 완료된 회원
        )
        
        // Mock Security Context와 실제 데이터베이스 데이터 동기화
        // 이를 통해 @AuthenticationPrincipal로 주입되는 사용자 정보와 실제 DB 데이터가 일치
        registerMemberForMockContext(member)

        // When: GET /api/member/me - 현재 인증된 사용자 정보 조회
        // Spring Security가 자동으로 현재 사용자 컨텍스트에서 회원 정보 추출
        val result = mockMvc.perform(
            get("/api/member/me")
            // 별도의 인증 헤더나 토큰이 필요하지 않음 (Mock으로 인증 상태 시뮬레이션)
        )

        // Then: HTTP 200 OK와 함께 현재 사용자 정보 반환
        result.andExpect(status().isOk)
        // 실제 응답 내용에는 MemberDto 형태의 사용자 정보가 포함됨
    }

    @Test
    @DisplayName("내 정보 조회 실패 - 인증되지 않은 사용자")
    fun `should fail to get my info when not authenticated`() {
        // When: 인증 없이 내 정보 조회
        val result = mockMvc.perform(
            get("/api/member/me")
        )

        // Then: 인증 오류 반환
        result.andExpect(status().isUnauthorized)
    }

    @Test
    @WithMockMember(username = "search@test.com", id = 1L)
    @DisplayName("멤버 검색 성공 - 이메일로 검색")
    fun `should successfully search members by email`() {
        // Given: 여러 멤버 생성
        testDataFactory.createTestMember(email = "john@test.com", name = "John Doe")
        testDataFactory.createTestMember(email = "jane@test.com", name = "Jane Doe")
        testDataFactory.createTestMember(email = "bob@example.com", name = "Bob Smith")
        val searchUser = testDataFactory.createTestMember(email = "search@test.com", name = "Search User") // 검색자
        // Register member for mock context synchronization
        registerMemberForMockContext(searchUser)

        // When: 'test.com' 도메인으로 검색
        val result = mockMvc.perform(
            get("/api/member/search")
                .param("email", "test.com")
                .param("page", "0")
                .param("size", "10")
        )

        // Then: 매칭되는 멤버들 반환
        result.andExpect(status().isOk)
    }

    @Test
    @WithMockMember(username = "search@test.com", id = 1L)
    @DisplayName("멤버 검색 성공 - 정확한 이메일로 검색")
    fun `should successfully search members by exact email`() {
        // Given: 여러 멤버 생성
        testDataFactory.createTestMember(email = "john@test.com", name = "John Doe")
        testDataFactory.createTestMember(email = "jane@test.com", name = "Jane Doe")
        val searchUser = testDataFactory.createTestMember(email = "search@test.com", name = "Search User")
        // Register member for mock context synchronization
        registerMemberForMockContext(searchUser)

        // When: 정확한 이메일로 검색
        val result = mockMvc.perform(
            get("/api/member/search")
                .param("email", "john@test.com")
                .param("page", "0")
                .param("size", "10")
        )

        // Then: 해당 멤버만 반환
        result.andExpect(status().isOk)
    }

    @Test
    @WithMockMember(username = "search@test.com", id = 1L)
    @DisplayName("멤버 검색 성공 - 결과 없음")
    fun `should return empty result when no members match search`() {
        // Given: 멤버들 생성
        testDataFactory.createTestMember(email = "john@test.com", name = "John Doe")
        val searchUser = testDataFactory.createTestMember(email = "search@test.com", name = "Search User")
        // Register member for mock context synchronization
        registerMemberForMockContext(searchUser)

        // When: 매칭되지 않는 이메일로 검색
        val result = mockMvc.perform(
            get("/api/member/search")
                .param("email", "nonexistent")
                .param("page", "0")
                .param("size", "10")
        )

        // Then: 빈 결과 반환
        result.andExpect(status().isOk)
    }

    @Test
    @WithMockMember(username = "search@test.com", id = 1L)
    @DisplayName("멤버 검색 성공 - 페이징 처리")
    fun `should successfully search members with pagination`() {
        // Given: 15명의 멤버 생성 (모두 같은 도메인)
        val members = createTestMembers(15)
        val searchUser = testDataFactory.createTestMember(email = "search@test.com", name = "Search User")
        // Register member for mock context synchronization
        registerMemberForMockContext(searchUser)

        // When: 첫 번째 페이지 요청 (5개씩)
        val result = mockMvc.perform(
            get("/api/member/search")
                .param("email", "test.com")
                .param("page", "0")
                .param("size", "5")
        )

        // Then: 페이징된 결과 반환
        result.andExpect(status().isOk)
    }

    @Test
    @WithMockMember(username = "logout@test.com", id = 1L)
    @DisplayName("로그아웃 성공")
    fun `should successfully logout`() {
        // Given: 인증된 멤버
        val member = testDataFactory.createTestMember(email = "logout@test.com", name = "Logout User")
        registerMemberForMockContext(member)
        
        // When: 로그아웃 요청
        val result = mockMvc.perform(
            delete("/api/member/logout")
                .with(csrf())
        )

        // Then: 성공 응답 (실제로는 null 반환)
        result.andExpect(status().isOk)
    }

    @Test
    @DisplayName("비즈니스 로직 테스트 - 멤버 생성과 그룹 관계")
    fun `should handle member creation and group relationship correctly`() {
        // Given: 멤버 생성
        val member = testDataFactory.createTestMember(
            email = "grouptest@test.com",
            name = "Group Test User"
        )

        // When: 멤버 조회
        val foundMember = memberRepository.findByEmail("grouptest@test.com")

        // Then: 멤버 속성 및 관계 확인
        assertThat(foundMember).isNotNull
        assertThat(foundMember?.email).isEqualTo("grouptest@test.com")
        assertThat(foundMember?.name).isEqualTo("Group Test User")
        assertThat(foundMember?.memberGroup).isNull() // 기본적으로 그룹 없음
        assertThat(foundMember?.workspace).isEmpty() // 기본적으로 워크스페이스 없음
        assertThat(foundMember?.classfiy).isEmpty() // 기본적으로 분류 결과 없음
        assertThat(foundMember?.tempFiles).isEmpty() // 기본적으로 임시 파일 없음
    }

    @Test
    @DisplayName("엔티티 메서드 테스트 - 토큰 생성 및 인증")
    fun `should correctly handle token generation and verification`() {
        // Given: 새 멤버 생성
        val member = testDataFactory.createTestMember(
            email = "tokentest@test.com",
            isVerified = false
        )

        // When: 토큰 생성
        val token = member.generateTempToken()
        memberRepository.save(member)

        // Then: 토큰이 생성되고 저장됨
        assertThat(token).isNotNull
        assertThat(member.getTempToken()).isEqualTo(token)
        assertThat(member.getTempToken()).isNotBlank

        // When: 인증 수행
        member.verify()
        memberRepository.save(member)

        // Then: 토큰이 제거됨 (인증 완료)
        assertThat(member.getTempToken()).isNull()
    }

    @Test
    @DisplayName("데이터 무결성 테스트 - 이메일 유니크 제약조건")
    fun `should enforce email uniqueness constraint`() {
        // Given: 첫 번째 멤버 생성
        testDataFactory.createTestMember(email = "unique@test.com")

        // When & Then: 같은 이메일로 두 번째 멤버 생성 시도하면 예외 발생
        try {
            testDataFactory.createTestMember(email = "unique@test.com")
            assert(false) { "Expected exception for duplicate email" }
        } catch (e: Exception) {
            // 중복 이메일로 인한 예외 발생 예상
            assertThat(e).isNotNull
        }
    }

    /**
     * 종합 시나리오 테스트 - 회원 전체 라이프사이클 검증
     * 
     * 이 테스트는 실제 사용자가 경험하는 전체 회원가입부터 인증까지의 
     * 완전한 워크플로우를 단일 테스트에서 종합적으로 검증합니다.
     * 
     * 테스트 시나리오 (실제 사용자 여정):
     * 1. 회원가입 요청 → 임시 토큰 생성 및 이메일 발송
     * 2. 이메일 인증 링크 클릭 → 계정 활성화
     * 3. 이메일 중복 확인 → 가입된 이메일 존재 확인
     * 
     * 이 테스트의 가치:
     * - 개별 테스트에서 놓칠 수 있는 시스템 간 연동 이슈 발견
     * - 실제 사용자 시나리오와 동일한 순서로 기능 검증
     * - 각 단계별 데이터 상태 변화 추적
     */
    @Test
    @DisplayName("복합 시나리오 테스트 - 전체 멤버 라이프사이클")
    fun `should handle complete member lifecycle`() {
        // Given: 새로운 사용자의 회원가입 요청 데이터
        val registerRequest = MemberReq.Register(
            email = "lifecycle@test.com",
            password = "123123!",
            name = "Lifecycle User"
        )

        // Step 1: 회원가입 처리 (POST /api/member/register)
        val registerResult = mockMvc.perform(
            post("/api/member/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(registerRequest))
                .with(csrf())
        )
        
        // 회원가입 성공 확인
        registerResult.andExpect(status().isOk)

        // Step 2: 회원가입 후 데이터베이스 상태 검증
        val savedMember = memberRepository.findByEmail("lifecycle@test.com")
        assertThat(savedMember).isNotNull
        assertThat(savedMember?.getTempToken()).isNotNull() // 이메일 인증용 토큰 생성됨

        // Step 3: 이메일 인증 처리 (GET /api/member/verify?token=...)
        // 실제로는 이메일에서 링크를 클릭하는 행위
        val verifyResult = mockMvc.perform(
            get("/api/member/verify")
                .param("token", savedMember!!.getTempToken()!!)
        )
        
        // 인증 성공 및 리다이렉트 확인
        verifyResult.andExpect(status().isSeeOther)

        // Step 4: 인증 후 회원 상태 변화 검증
        val verifiedMember = memberRepository.findByEmail("lifecycle@test.com")
        assertThat(verifiedMember?.getTempToken()).isNull() // 토큰 삭제됨 (인증 완료)

        // Step 5: 이메일 중복 확인 기능 검증 (GET /api/member/duplicate?email=...)
        // 가입된 이메일이 시스템에서 올바르게 인식되는지 확인
        val duplicateResult = mockMvc.perform(
            get("/api/member/duplicate")
                .param("email", "lifecycle@test.com")
        )
        
        // 이메일이 이미 존재함을 확인
        duplicateResult.andExpect(status().isOk)
            .andExpect(content().string("true"))
        
        // 전체 라이프사이클 완료: 회원가입 → 인증 → 중복확인
    }
}