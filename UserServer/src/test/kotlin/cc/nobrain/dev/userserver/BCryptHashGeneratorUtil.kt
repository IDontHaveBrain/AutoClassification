package cc.nobrain.dev.userserver

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

/**
 * BCrypt 해시 생성 유틸리티
 * 
 * OAuth2 클라이언트 시크릿 또는 사용자 패스워드를 BCrypt 알고리즘으로 해시화하는 유틸리티입니다.
 * Spring Security의 SecurityConfig에서 사용할 해시 값을 생성하고 검증합니다.
 * 
 * 주요 용도:
 * - OAuth2 클라이언트 시크릿 해시 생성
 * - 사용자 패스워드 해시 생성
 * - 기존 해시 값 검증 및 매칭 테스트
 * - 프로덕션 설정용 해시 값 준비
 * 
 * BCrypt 알고리즘 특징:
 * - 솔트(salt) 자동 생성 및 포함
 * - 적응형 해시 함수 (시간이 지나면서 보안 강화 가능)
 * - 무지개 테이블(rainbow table) 공격 방지
 * - 동일한 입력도 매번 다른 해시 생성 (솔트 때문)
 * 
 * 보안 고려사항:
 * - 작업 요소(work factor) 기본값 사용 (약 10-12)
 * - 해시 검증은 반드시 matches() 메소드 사용
 * - 해시 값은 $2a$rounds$salt+hash 형태로 구성
 * 
 * 사용 방법:
 * 1. 이 main 함수 실행
 * 2. 출력된 해시 값을 SecurityConfig에 적용
 * 3. 기존 해시와의 호환성 확인
 * 
 * @see org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
 * @see cc.nobrain.dev.userserver.common.security.SecurityConfig
 */
fun main() {
    // 기본 설정의 BCrypt 인코더 생성 (작업 요소 자동 결정)
    val encoder = BCryptPasswordEncoder()
    val plainSecret = "public"
    
    // 플레인 텍스트를 BCrypt로 해시화
    val hashedSecret = encoder.encode(plainSecret)
    
    println("=== BCrypt 해시 생성 결과 ===")
    println("Plain text: $plainSecret")
    println("BCrypt hash: $hashedSecret")
    
    // SecurityConfig에서 현재 사용 중인 해시와 비교 검증
    val currentHash = "\$2a\$10\$d5nJ4FfbF0yLD2sgQ3EbpOqOBEQJn5rX2v/Fv/nGHPjfurbGl9tXy"
    val matches = encoder.matches(plainSecret, currentHash)
    
    println("\n=== 기존 해시 검증 ===")
    println("Current hash: $currentHash")
    println("Current hash matches 'public': $matches")
    
    println("\n=== 새 해시 검증 ===")
    println("New hash matches 'public': ${encoder.matches(plainSecret, hashedSecret)}")
    
    if (!matches) {
        println("\n⚠️  경고: 현재 SecurityConfig의 해시가 'public'과 일치하지 않습니다!")
        println("새로 생성된 해시를 SecurityConfig에 적용하세요: $hashedSecret")
    } else {
        println("\n✅ 현재 SecurityConfig의 해시가 정상적으로 작동합니다.")
    }
}