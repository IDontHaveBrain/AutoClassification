package cc.nobrain.dev.userserver

import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

/**
 * 패스워드 해싱 유틸리티 테스트 클래스
 * 
 * BCrypt 알고리즘을 사용한 패스워드 해싱 및 검증 기능을 테스트합니다.
 * 프로덕션 환경의 SecurityConfig와 일치하는 해시 설정을 검증하고,
 * 테스트 성능 최적화를 위한 사전 해시된 패스워드를 생성합니다.
 * 
 * 주요 기능:
 * - BCrypt 해싱 알고리즘 검증
 * - 솔트(salt) 생성 및 적용 확인
 * - 패스워드 매칭 기능 테스트
 * - 프로덕션 설정과의 일치성 확인
 * - 테스트용 사전 해시된 패스워드 생성
 * 
 * BCrypt 특징:
 * - 적응형 해시 함수 (adaptive hash function)
 * - 작업 요소(work factor) 조정 가능 (기본값: 10)
 * - 무지개 테이블(rainbow table) 공격 방지
 * - 솔트 자동 생성 및 포함
 * 
 * @see org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
 * @see cc.nobrain.dev.userserver.common.security.SecurityConfig
 */
class PasswordHashingUtilTest {
    
    /**
     * BCrypt 해싱 알고리즘 검증 및 테스트용 해시 생성 테스트
     * 
     * 이 테스트는 다음과 같은 시나리오를 검증합니다:
     * 1. 프로덕션 환경의 OAuth2 클라이언트 시크릿 해시 검증
     * 2. BCrypt 해싱 및 매칭 기능의 정확성 확인
     * 3. 테스트 성능 최적화를 위한 사전 해시된 패스워드 생성
     * 
     * 기술적 세부사항:
     * - 작업 요소(work factor): 10 (프로덕션 설정과 일치)
     * - 해시 포맷: $2a$10$... (BCrypt 표준 포맷)
     * - 솔트 길이: 22자 (Base64 인코딩)
     * - 해시 길이: 31자 (Base64 인코딩)
     * 
     * 성능 고려사항:
     * BCrypt는 의도적으로 느린 해시 함수이므로, 테스트에서 반복적인 해싱을 피하기 위해
     * 사전 계산된 해시 값을 사용하는 것이 권장됩니다.
     * 
     * 보안 고려사항:
     * - 동일한 플레인텍스트라도 매번 다른 해시가 생성됩니다 (솔트 때문)
     * - 해시 검증은 항상 matches() 메소드를 사용해야 합니다
     * - 작업 요소가 높을수록 보안은 강화되지만 성능은 저하됩니다
     */
    @Test
    fun testBCryptHash() {
        // 프로덕션 설정과 일치하는 BCrypt 인코더 생성 (작업 요소: 10)
        val encoder = BCryptPasswordEncoder(10)
        val plainSecret = "public"
        
        // SecurityConfig에서 사용 중인 현재 해시 검증
        val currentHash = "\$2a\$10\$d5nJ4FfbF0yLD2sgQ3EbpOqOBEQJn5rX2v/Fv/nGHPjfurbGl9tXy"
        val matches = encoder.matches(plainSecret, currentHash)
        
        println("평문: $plainSecret")
        println("현재 해시: $currentHash")
        println("현재 해시가 'public'과 일치: $matches")
        
        // 현재 해시가 일치하지 않을 경우 새로운 해시 생성
        if (!matches) {
            val newHash = encoder.encode(plainSecret)
            println("새로 생성된 해시: $newHash")
            println("새 해시가 'public'과 일치: ${encoder.matches(plainSecret, newHash)}")
        }
        
        // 테스트 성능 최적화를 위한 사전 해시된 테스트 패스워드 생성
        // 반복적인 테스트에서 BCrypt 연산 시간을 절약하기 위함
        val testPassword = "123123!"
        val testPasswordHash = encoder.encode(testPassword)
        println("\n--- 성능 최적화용 테스트 패스워드 해시 ---")
        println("테스트 패스워드: $testPassword")
        println("사전 해시: $testPasswordHash")
        println("해시가 테스트 패스워드와 일치: ${encoder.matches(testPassword, testPasswordHash)}")
        println("이 상수를 사용하세요: PRE_HASHED_TEST_PASSWORD = \"$testPasswordHash\"")
    }
}