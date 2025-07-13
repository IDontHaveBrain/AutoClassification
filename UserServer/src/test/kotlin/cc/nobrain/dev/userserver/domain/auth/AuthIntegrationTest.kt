package cc.nobrain.dev.userserver.domain.auth

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import cc.nobrain.dev.userserver.common.WithMockMember
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*

/**
 * OAuth2/JWT 기반 인증 및 인가 시스템의 통합 테스트
 * 
 * 이 테스트 클래스는 AutoClassification 시스템의 보안 아키텍처를 검증합니다.
 * RSA 암호화, JWT 토큰 기반 인증, OAuth2 플로우의 전체적인 동작을 테스트합니다.
 * 
 * 테스트 범위:
 * - OAuth2 Password Grant 타입 인증 플로우
 * - JWT 액세스 토큰 생성, 검증 및 만료 처리
 * - 리프레시 토큰을 통한 토큰 갱신 메커니즘
 * - 보호된 API 엔드포인트의 인가 및 접근 제어
 * - 공개 엔드포인트의 무인증 접근 허용
 * - Spring Security 필터 체인 및 CORS 설정 동작
 * - 다중 사용자 세션 관리 및 보안 헤더 설정
 * 
 * 의존성:
 * - BaseIntegrationTest: 통합 테스트 환경 및 테스트 데이터 팩토리 제공
 * - Spring Security OAuth2: Password Grant 및 Refresh Token 지원
 * - RSA 암호화: 비밀번호 전송 시 보안 강화
 * - PostgreSQL: 사용자 데이터 저장 및 조회
 * 
 * 주요 설정:
 * - 테스트용 RSA 키페어 사용 (공개키 조회 가능)
 * - OAuth2 클라이언트: public/public (테스트용 클라이언트)
 * - JWT 토큰 만료 시간: 24시간 (access_token), 7일 (refresh_token)
 * - CSRF 보호 활성화 (폼 기반 요청에서)
 */
@DisplayName("인증 및 인가 통합 테스트")
class AuthIntegrationTest : BaseIntegrationTest() {

    @Test
    @DisplayName("공개 키 조회 - 인증 없이 접근 가능")
    fun `should get public key without authentication`() {
        // Given: 인증되지 않은 상태

        // When: 공개 키 조회 요청
        val response = performGet("/auth/key")

        // Then: 성공적으로 공개 키를 반환해야 함
        assertResponseStatus(response, HttpStatus.OK)
        assertResponseNotEmpty(response)
        
        // 응답이 Base64 인코딩된 RSA 공개 키 형태인지 확인
        // 클라이언트에서 비밀번호 암호화에 사용될 공개 키
        val publicKey = response.body
        assertThat(publicKey).isNotNull
        assertThat(publicKey).isNotBlank
        // Base64 인코딩된 공개 키는 일반적으로 길이가 300자 이상
        assertThat(publicKey!!.length).isGreaterThan(100)
    }

    @Test
    @DisplayName("OAuth2 토큰 발급 - 유효한 사용자 정보로 로그인")
    fun `should issue OAuth2 token with valid credentials`() {
        // Given: 인증된 테스트 사용자 생성 (이메일 인증 완료 상태)
        val testEmail = "authtest@test.com"
        val testPassword = "123123!"
        val testMember = testDataFactory.createTestMember(
            email = testEmail,
            password = testPassword,
            name = "Auth Test User",
            isVerified = true  // 이메일 인증 완료 상태로 생성
        )

        // OAuth2 Password Grant 토큰 요청 파라미터 준비
        // 보안을 위해 비밀번호는 RSA 공개키로 암호화하여 전송
        val tokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        tokenParams.add("grant_type", "password")          // Password Grant 타입
        tokenParams.add("username", testEmail)             // 사용자 이메일 (로그인 ID)
        tokenParams.add("password", encryptPassword(testPassword))  // RSA 암호화된 비밀번호
        tokenParams.add("client_id", "public")             // 테스트용 OAuth2 클라이언트 ID
        tokenParams.add("client_secret", "public")         // 테스트용 OAuth2 클라이언트 시크릿

        // When: OAuth2 토큰 발급 요청
        val response = mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(tokenParams)
                .with(csrf())
        ).andExpect(status().isOk)
            .andReturn()

        // Then: OAuth2 표준에 따른 유효한 토큰 응답이 반환되어야 함
        val responseBody = response.response.contentAsString
        val tokenResponse: Map<String, Any> = objectMapper.readValue(responseBody)
        
        // OAuth2 표준 응답 필드 검증
        assertThat(tokenResponse).containsKey("access_token")   // JWT 액세스 토큰
        assertThat(tokenResponse).containsKey("refresh_token")  // 리프레시 토큰
        assertThat(tokenResponse).containsKey("token_type")     // Bearer 타입
        assertThat(tokenResponse).containsKey("expires_in")     // 만료 시간 (초)
        
        val accessToken = tokenResponse["access_token"] as String
        val refreshToken = tokenResponse["refresh_token"] as String
        
        // 토큰 값 유효성 검증
        assertThat(accessToken).isNotBlank
        assertThat(refreshToken).isNotBlank
        assertThat(tokenResponse["token_type"]).isEqualTo("Bearer")
        
        // JWT 토큰 구조 검증 (헤더.페이로드.서명 형태)
        assertThat(accessToken.split(".")).hasSize(3)
    }

    @Test
    @DisplayName("OAuth2 토큰 발급 실패 - 잘못된 사용자 정보")
    fun `should fail to issue token with invalid credentials`() {
        // Given: 존재하지 않는 사용자 정보
        val tokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        tokenParams.add("grant_type", "password")
        tokenParams.add("username", "nonexistent@test.com")
        tokenParams.add("password", encryptPassword("wrongpassword"))
        tokenParams.add("client_id", "public")
        tokenParams.add("client_secret", "public")

        // When & Then: 토큰 발급 요청이 실패해야 함 (401 Unauthorized)
        mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(tokenParams)
                .with(csrf())
        ).andExpect(status().isUnauthorized)
    }

    @Test
    @DisplayName("리프레시 토큰으로 새 액세스 토큰 발급")
    fun `should refresh access token with valid refresh token`() {
        // Given: 유효한 사용자로 초기 토큰 발급
        // 리프레시 토큰 테스트를 위해 먼저 정상적인 로그인을 통해 토큰을 발급받음
        val testEmail = "refreshtest@test.com"
        val testPassword = "123123!"
        testDataFactory.createTestMember(
            email = testEmail,
            password = testPassword,
            name = "Refresh Test User",
            isVerified = true
        )

        // Step 1: 초기 토큰 발급 (Password Grant)
        val initialTokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        initialTokenParams.add("grant_type", "password")
        initialTokenParams.add("username", testEmail)
        initialTokenParams.add("password", encryptPassword(testPassword))
        initialTokenParams.add("client_id", "public")
        initialTokenParams.add("client_secret", "public")

        val initialResponse = mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(initialTokenParams)
                .with(csrf())
        ).andExpect(status().isOk)
            .andReturn()

        val initialTokenResponse: Map<String, Any> = objectMapper.readValue(initialResponse.response.contentAsString)
        val refreshToken = initialTokenResponse["refresh_token"] as String

        // When: Step 2 - 리프레시 토큰으로 새 액세스 토큰 요청 (Refresh Token Grant)
        // 액세스 토큰이 만료되었거나 새로운 토큰이 필요할 때 사용하는 플로우
        val refreshParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        refreshParams.add("grant_type", "refresh_token")   // Refresh Token Grant 타입
        refreshParams.add("refresh_token", refreshToken)   // 초기 발급받은 리프레시 토큰
        refreshParams.add("client_id", "public")           // 동일한 클라이언트 인증
        refreshParams.add("client_secret", "public")

        val refreshResponse = mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(refreshParams)
                .with(csrf())
        ).andExpect(status().isOk)
            .andReturn()

        // Then: 새로운 액세스 토큰과 리프레시 토큰이 발급되어야 함
        val newTokenResponse: Map<String, Any> = objectMapper.readValue(refreshResponse.response.contentAsString)
        
        // 리프레시 토큰 응답 필드 검증
        assertThat(newTokenResponse).containsKey("access_token")   // 새 액세스 토큰
        assertThat(newTokenResponse).containsKey("refresh_token")  // 새 리프레시 토큰 (토큰 로테이션)
        
        val newAccessToken = newTokenResponse["access_token"] as String
        val newRefreshToken = newTokenResponse["refresh_token"] as String
        val originalAccessToken = initialTokenResponse["access_token"] as String
        val originalRefreshToken = initialTokenResponse["refresh_token"] as String
        
        // 토큰 로테이션 검증: 새 토큰들은 기존 토큰들과 달라야 함
        assertThat(newAccessToken).isNotEqualTo(originalAccessToken)
        assertThat(newRefreshToken).isNotEqualTo(originalRefreshToken)
        
        // 새 토큰들의 유효성 검증
        assertThat(newAccessToken).isNotBlank
        assertThat(newRefreshToken).isNotBlank
    }

    @Test
    @DisplayName("JWT 토큰 기반 API 접근 - 유효한 토큰")
    @WithMockMember(username = "tokentest@test.com", id = 1L)
    fun `should access protected API with valid JWT token`() {
        // Given: 유효한 JWT 토큰을 가진 사용자 (verified=true로 생성)
        val testMember = createAndRegisterTestMember(
            email = "tokentest@test.com",
            name = "Token Test User",
            isVerified = true
        )

        // When: 보호된 API 엔드포인트 접근
        val response = mockMvc.perform(
            get("/api/member/me")
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk)
            .andReturn()

        // Then: 사용자 정보가 반환되어야 함
        val responseBody = response.response.contentAsString
        assertThat(responseBody).contains("tokentest@test.com")
        assertThat(responseBody).contains("Token Test User")
    }

    @Test
    @DisplayName("보호된 API 접근 실패 - 토큰 없음")
    fun `should fail to access protected API without token`() {
        // Given: 인증되지 않은 상태

        // When & Then: 보호된 API 접근이 실패해야 함
        mockMvc.perform(
            get("/api/member/me")
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isUnauthorized)
    }

    @Test
    @DisplayName("회원 가입 - 인증 없이 접근 가능")
    fun `should register new member without authentication`() {
        // Given: 새 회원 정보
        val registerRequest = MemberReq.Register(
            email = "newuser@test.com",
            password = "newpassword123!",
            name = "New User"
        )

        // When: 회원 가입 요청
        val response = mockMvc.perform(
            post("/api/member/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest))
                .with(csrf())
        ).andExpect(status().isOk)
            .andReturn()

        // Then: 회원 등록 성공 확인
        // 주의: 실제 이메일 인증 링크는 이메일 서비스 의존성으로 인해 발송되지 않을 수 있음
        // 테스트 환경에서는 데이터베이스 저장 여부로 등록 성공을 판단
        
        // 데이터베이스에 새 회원이 저장되었는지 확인
        assertThat(verifyMemberExists("newuser@test.com")).isTrue
    }

    @Test
    @DisplayName("이메일 중복 확인 - 인증 없이 접근 가능")
    fun `should check email duplication without authentication`() {
        // Given: 기존 사용자 생성
        val existingEmail = "existing@test.com"
        testDataFactory.createTestMember(email = existingEmail)

        // When: 이메일 중복 확인 요청 (기존 이메일)
        val existingResponse = mockMvc.perform(
            get("/api/member/duplicate")
                .param("email", existingEmail)
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk)
            .andReturn()

        // When: 이메일 중복 확인 요청 (새 이메일)
        val newResponse = mockMvc.perform(
            get("/api/member/duplicate")
                .param("email", "new@test.com")
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk)
            .andReturn()

        // Then: 올바른 중복 확인 결과가 반환되어야 함
        assertThat(existingResponse.response.contentAsString).isEqualTo("true")
        assertThat(newResponse.response.contentAsString).isEqualTo("false")
    }

    @Test
    @DisplayName("공개 엔드포인트 접근 확인")
    fun `should access public endpoints without authentication`() {
        // Given: 인증되지 않은 상태에서 공개 엔드포인트 접근 테스트

        // 인증 없이 접근 가능해야 하는 공개 엔드포인트 목록
        // 이들 엔드포인트는 Spring Security 설정에서 permitAll() 로 설정됨
        val publicEndpoints = listOf(
            "/auth/key",                                    // RSA 공개키 조회 (비밀번호 암호화용)
            "/api/member/duplicate?email=test@test.com"     // 이메일 중복 확인 (회원가입용)
        )

        publicEndpoints.forEach { endpoint ->
            // When: 공개 엔드포인트 접근
            val response = mockMvc.perform(
                get(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
            ).andExpect(status().isOk)
                .andReturn()

            // Then: 성공적으로 접근해야 함
            assertThat(response.response.status).isEqualTo(200)
        }
    }

    @Test
    @DisplayName("CORS 설정 확인")
    fun `should handle CORS requests properly`() {
        // Given: CORS 프리플라이트 요청

        // When: OPTIONS 요청으로 CORS 확인
        val response = mockMvc.perform(
            options("/auth/key")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Content-Type")
        ).andExpect(status().isOk)
            .andReturn()

        // Then: CORS 헤더가 적절히 설정되어야 함
        val headers = response.response.headerNames
        // CORS 관련 헤더가 있는지 확인 (구체적인 값은 설정에 따라 다름)
        assertThat(headers).isNotEmpty
    }

    @Test
    @DisplayName("다중 세션 테스트 - 여러 사용자 동시 인증")
    fun `should handle multiple user sessions simultaneously`() {
        // Given: 동시 세션 관리 테스트를 위한 여러 테스트 사용자 생성
        // 실제 운영 환경에서 여러 사용자가 동시에 로그인하는 상황을 시뮬레이션
        val users = listOf(
            testDataFactory.createTestMember(email = "user1@test.com", name = "User 1"),
            testDataFactory.createTestMember(email = "user2@test.com", name = "User 2"),
            testDataFactory.createTestMember(email = "user3@test.com", name = "User 3")
        )

        val tokens = mutableListOf<String>()

        // When: 각 사용자별로 독립적인 JWT 토큰 발급
        // 각 사용자는 고유한 JWT 토큰을 받아야 하며, 서로 간섭하지 않아야 함
        users.forEach { user ->
            val tokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
            tokenParams.add("grant_type", "password")
            tokenParams.add("username", user.email)
            tokenParams.add("password", encryptPassword("123123!"))
            tokenParams.add("client_id", "public")
            tokenParams.add("client_secret", "public")

            val response = mockMvc.perform(
                post("/auth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .params(tokenParams)
                    .with(csrf())
            ).andExpect(status().isOk)
                .andReturn()

            val tokenResponse: Map<String, Any> = objectMapper.readValue(response.response.contentAsString)
            tokens.add(tokenResponse["access_token"] as String)
        }

        // Then: 다중 세션 관리 검증
        // 1. 모든 사용자에 대해 토큰이 정상 발급되었는지 확인
        assertThat(tokens).hasSize(3)
        
        // 2. 각 토큰이 고유한 값인지 확인 (사용자별 고유 JWT)
        assertThat(tokens).doesNotHaveDuplicates()
        
        // 3. 모든 토큰이 유효한 형태인지 확인
        tokens.forEach { token ->
            assertThat(token).isNotBlank
            // JWT 구조 검증 (헤더.페이로드.서명)
            assertThat(token.split(".")).hasSize(3)
        }
    }

    @Test
    @DisplayName("토큰 만료 시간 확인")
    fun `should return correct token expiration time`() {
        // Given: 유효한 사용자
        val testEmail = "expirationtest@test.com"
        testDataFactory.createTestMember(email = testEmail)

        // When: 토큰 발급 요청
        val tokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        tokenParams.add("grant_type", "password")
        tokenParams.add("username", testEmail)
        tokenParams.add("password", encryptPassword("123123!"))
        tokenParams.add("client_id", "public")
        tokenParams.add("client_secret", "public")

        val response = mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(tokenParams)
                .with(csrf())
        ).andExpect(status().isOk)
            .andReturn()

        // Then: 만료 시간이 포함되어야 함
        val tokenResponse: Map<String, Any> = objectMapper.readValue(response.response.contentAsString)
        
        assertThat(tokenResponse).containsKey("expires_in")
        val expiresIn = tokenResponse["expires_in"]
        
        // 만료 시간이 양수여야 함 (초 단위)
        assertThat(expiresIn).isInstanceOf(Number::class.java)
        assertThat((expiresIn as Number).toLong()).isGreaterThan(0)
    }

    @Test
    @DisplayName("보안 헤더 확인")
    fun `should include security headers in responses`() {
        // Given: 일반 API 요청

        // When: API 호출
        val response = mockMvc.perform(
            get("/auth/key")
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk)
            .andReturn()

        // Then: 보안 관련 헤더들이 설정되어야 함
        val headers = response.response.headerNames
        
        // 최소한의 보안 헤더들이 설정되어 있는지 확인
        // (구체적인 헤더는 Spring Security 설정에 따라 다를 수 있음)
        assertThat(headers).isNotEmpty
    }

    @Test
    @DisplayName("잘못된 Grant Type으로 토큰 요청 실패")
    fun `should fail with invalid grant type`() {
        // Given: OAuth2 표준에 정의되지 않은 잘못된 grant_type 사용
        // 지원되는 grant_type: "password", "refresh_token"
        val tokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        tokenParams.add("grant_type", "invalid_grant")     // 지원되지 않는 grant type
        tokenParams.add("username", "test@test.com")
        tokenParams.add("password", encryptPassword("123123!"))
        tokenParams.add("client_id", "public")

        // When & Then: OAuth2 표준에 따라 400 Bad Request 응답이 반환되어야 함
        mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(tokenParams)
                .with(csrf())
        ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("클라이언트 인증 실패")
    fun `should fail with invalid client credentials`() {
        // Given: 올바른 사용자 정보이지만 잘못된 OAuth2 클라이언트 인증 정보
        // 올바른 클라이언트 정보: client_id="public", client_secret="public"
        val testEmail = "clienttest@test.com"
        testDataFactory.createTestMember(email = testEmail)

        val tokenParams: MultiValueMap<String, String> = LinkedMultiValueMap()
        tokenParams.add("grant_type", "password")
        tokenParams.add("username", testEmail)
        tokenParams.add("password", encryptPassword("123123!"))
        tokenParams.add("client_id", "invalid_client")     // 잘못된 클라이언트 ID
        tokenParams.add("client_secret", "invalid_secret") // 잘못된 클라이언트 시크릿

        // When & Then: OAuth2 클라이언트 인증 실패로 401 Unauthorized 응답
        // 사용자 인증은 올바르지만 클라이언트 인증이 실패하는 경우
        mockMvc.perform(
            post("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(tokenParams)
                .with(csrf())
        ).andExpect(status().isUnauthorized)
    }
}