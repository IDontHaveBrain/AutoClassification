package cc.nobrain.dev.userserver

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.springframework.http.HttpStatus

/**
 * 프로필별 헬스체크 및 연결 테스트
 * BaseIntegrationTest를 사용하여 프로필에 따라 H2 또는 Docker 환경에서 테스트
 * 
 * 사용법:
 * - H2 기반 테스트: -Dspring.profiles.active=test (기본값)
 * - Docker 기반 테스트: -Dspring.profiles.active=docker
 */
@DisplayName("프로필별 헬스체크 통합 테스트")
class ContainerHealthIntegrationTest : BaseIntegrationTest() {

    @Test
    @DisplayName("인프라 상태 확인 - 프로필별 데이터베이스 및 연결 테스트")
    fun testInfrastructureHealthCheck() {
        // Given: 활성 프로필에 따른 인프라가 실행 중이어야 함 (Docker 또는 H2)
        if (isDockerProfileActive()) {
            verifyContainerStatus() // Docker 프로필일 때만 컨테이너 상태 확인
        }
        
        // When: 데이터베이스 연결 상태 확인
        val isDatabaseConnected = verifyDatabaseConnection()
        
        // Then: 데이터베이스가 정상 작동해야 함
        assert(isDatabaseConnected) { "데이터베이스 연결이 정상적으로 작동해야 합니다" }
        
        println("✅ 인프라 헬스체크 통과:")
        printContainerInfo()
    }

    @Test
    @DisplayName("기본 엔드포인트 연결 테스트")
    fun testBasicEndpointConnectivity() {
        // Given: 애플리케이션이 시작되어 있음
        
        // When: 기본 엔드포인트에 접근 (인증 없이 접근 가능한 엔드포인트)
        val response = performGet("/actuator/health")
        
        // Then: 응답이 성공적이어야 함 (또는 인증 오류여야 함 - 둘 다 애플리케이션이 작동 중임을 의미)
        assert(response.statusCode == HttpStatus.OK || response.statusCode == HttpStatus.UNAUTHORIZED) {
            "애플리케이션이 실행 중이고 응답해야 합니다. 상태: ${response.statusCode}"
        }
        
        println("✅ 기본 엔드포인트 연결 테스트 통과")
        println("응답 상태: ${response.statusCode}")
    }

    @Test
    @DisplayName("테스트 데이터 생성 및 정리 확인")
    fun testDataLifecycle() {
        // Given: 깨끗한 데이터베이스 상태
        val currentProfile = if (isDockerProfileActive()) "docker" else "test"
        
        // When: 테스트 멤버 생성
        val testMember = testDataFactory.createTestMember(
            email = "profile-test@test.com",
            name = "Profile Test User"
        )
        
        // Then: 데이터가 정상적으로 생성되어야 함
        assert(memberRepository.existsById(testMember.id!!)) {
            "테스트 멤버가 성공적으로 생성되어야 합니다"
        }
        
        // When: 데이터 정리
        cleanupTestData()
        
        // Then: 데이터가 정상적으로 정리되어야 함
        assert(memberRepository.count() == 0L) {
            "모든 테스트 데이터가 정리되어야 합니다"
        }
        
        println("✅ 데이터 라이프사이클 테스트 통과 (프로필: $currentProfile)")
    }
}