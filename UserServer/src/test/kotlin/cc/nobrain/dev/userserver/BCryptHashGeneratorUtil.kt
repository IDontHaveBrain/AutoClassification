package cc.nobrain.dev.userserver

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

/**
 * BCrypt 해시 생성 유틸리티
 * SecurityConfig에서 사용할 OAuth2 클라이언트 시크릿 해시를 생성합니다.
 */
fun main() {
    // 기본 설정의 BCrypt 인코더 생성 (작업 요소 자동 결정)
    val encoder = BCryptPasswordEncoder()
    val plainSecret = "public"
    
    // 플레인 텍스트를 BCrypt로 해시화
    val hashedSecret = encoder.encode(plainSecret)
    
    println("=== BCrypt 해시 생성 결과 ===")
    println("평문: $plainSecret")
    println("BCrypt 해시: $hashedSecret")
    
    // SecurityConfig에서 현재 사용 중인 해시와 비교 검증
    val currentHash = "\$2a\$10\$d5nJ4FfbF0yLD2sgQ3EbpOqOBEQJn5rX2v/Fv/nGHPjfurbGl9tXy"
    val matches = encoder.matches(plainSecret, currentHash)
    
    println("\n=== 기존 해시 검증 ===")
    println("현재 해시: $currentHash")
    println("현재 해시 일치 ('public'): $matches")
    
    println("\n=== 새 해시 검증 ===")
    println("새 해시 일치 ('public'): ${encoder.matches(plainSecret, hashedSecret)}")
    
    if (!matches) {
        println("\n⚠️  경고: 현재 SecurityConfig의 해시가 'public'과 일치하지 않습니다!")
        println("새로 생성된 해시를 SecurityConfig에 적용하세요: $hashedSecret")
    } else {
        println("\n✅ 현재 SecurityConfig의 해시가 정상적으로 작동합니다.")
    }
}