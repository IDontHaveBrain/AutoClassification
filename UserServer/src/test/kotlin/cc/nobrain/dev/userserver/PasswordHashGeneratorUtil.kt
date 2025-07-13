package cc.nobrain.dev.userserver

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

/**
 * 테스트용 사전 해시된 패스워드 생성 유틸리티
 * 
 * 테스트 코드에서 반복적인 BCrypt 해싱 연산으로 인한 성능 저하를 방지하기 위해
 * 사전에 계산된 해시 값을 생성하는 유틸리티입니다.
 * 
 * 성능 최적화 배경:
 * BCrypt는 의도적으로 느린 해시 함수로 설계되었습니다. 작업 요소가 10일 때
 * 하나의 패스워드를 해시하는데 약 100-200ms가 소요됩니다. 테스트에서 매번
 * 새로 해시를 생성하면 전체 테스트 실행 시간이 크게 증가합니다.
 * 
 * 사전 해시 사용의 장점:
 * - 테스트 실행 시간 대폭 단축 (100ms → 1ms 미만)
 * - 일관된 테스트 결과 보장
 * - 테스트 데이터의 예측 가능성
 * - CI/CD 파이프라인 성능 향상
 * 
 * 주요 기능:
 * - 표준 테스트 패스워드 "123123!" 해시 생성
 * - 프로덕션 설정과 일치하는 작업 요소(10) 사용
 * - 생성된 해시의 정확성 검증
 * - 테스트 코드에서 사용할 상수 형태로 출력
 * 
 * 보안 고려사항:
 * 이 유틸리티는 테스트 목적으로만 사용되며, 실제 사용자 패스워드는
 * 항상 런타임에 동적으로 해시되어야 합니다.
 * 
 * 사용 패턴:
 * 1. 이 유틸리티 실행하여 해시 값 생성
 * 2. TestConstants 클래스에 상수로 정의
 * 3. 테스트 코드에서 사전 계산된 해시 값 사용
 * 
 * 예시:
 * ```kotlin
 * object TestConstants {
 *     const val TEST_PASSWORD = "123123!"
 *     const val PRE_HASHED_TEST_PASSWORD = "[여기에 생성된 해시 값]"
 * }
 * ```
 * 
 * @see org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
 * @see cc.nobrain.dev.userserver.common.TestConstants
 */
fun main() {
    // 프로덕션 설정과 일치하는 BCrypt 인코더 생성 (작업 요소: 10)
    val encoder = BCryptPasswordEncoder(10)
    val testPassword = "123123!"
    
    println("=== 테스트용 패스워드 해시 생성 ===")
    
    // 테스트용 패스워드를 BCrypt로 해시화
    val hashedPassword = encoder.encode(testPassword)
    
    println("Test password: $testPassword")
    println("Pre-hashed (BCrypt): $hashedPassword")
    println()
    
    // 생성된 해시의 정확성 검증
    println("=== 해시 검증 ===")
    val isValid = encoder.matches(testPassword, hashedPassword)
    println("Hash matches password: $isValid")
    
    if (isValid) {
        println("✅ 해시가 올바르게 생성되었습니다.")
    } else {
        println("❌ 해시 생성에 문제가 있습니다!")
        return
    }
    
    // 테스트 코드에서 사용할 상수 형태로 출력
    println("\n=== 테스트 코드에서 사용할 상수 ===")
    println("const val PRE_HASHED_TEST_PASSWORD = \"$hashedPassword\"")
    
    println("\n=== 사용 방법 ===")
    println("1. 위의 상수를 TestConstants 클래스에 추가")
    println("2. 테스트에서 encoder.encode() 대신 PRE_HASHED_TEST_PASSWORD 사용")
    println("3. 테스트 실행 시간 단축 및 성능 향상 확인")
}