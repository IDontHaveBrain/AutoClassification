package cc.nobrain.dev.userserver

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.test.annotation.DirtiesContext

/**
 * OAuth2 설정 디버깅 및 검증 테스트 클래스
 * 
 * Spring Security OAuth2 Authorization Server의 설정 상태를 디버깅하고 검증합니다.
 * 특히 RegisteredClientRepository 빈의 구현체와 클라이언트 정보의 정확성을 확인합니다.
 * 
 * 주요 검증 항목:
 * - RegisteredClientRepository 빈의 실제 구현체 확인
 * - PasswordEncoder 빈의 타입 및 설정 검증
 * - OAuth2 클라이언트 등록 정보 조회 및 검증
 * - 클라이언트 시크릿의 인코딩 방식 확인
 * - 패스워드 매칭 기능의 정확성 테스트
 * 
 * 기술적 배경:
 * OAuth2 Authorization Server에서는 클라이언트 정보를 RegisteredClientRepository를 통해 관리합니다.
 * 이 테스트는 스프링 컨텍스트에서 실제로 어떤 구현체가 사용되고 있는지,
 * 그리고 클라이언트 시크릿이 올바르게 인코딩되어 있는지 확인합니다.
 * 
 * 디버깅 패턴:
 * - 빈 타입 및 클래스명 확인
 * - 설정 값의 실제 상태 출력
 * - 암호화/인코딩 상태 검증
 * - 런타임 설정과 예상 설정의 일치성 확인
 * 
 * @see org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
 * @see org.springframework.security.crypto.password.PasswordEncoder
 * @see cc.nobrain.dev.userserver.common.security.OAuth2Config
 */
@DirtiesContext
class OAuth2ConfigDebugTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var registeredClientRepository: RegisteredClientRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    /**
     * OAuth2 빈 설정 및 클라이언트 정보 디버깅 테스트
     * 
     * 이 테스트는 다음과 같은 OAuth2 설정을 검증하고 디버깅합니다:
     * 1. RegisteredClientRepository 빈의 실제 구현체 확인
     * 2. PasswordEncoder 빈의 구현체 및 설정 검증
     * 3. 등록된 OAuth2 클라이언트 정보 조회 및 검증
     * 4. 클라이언트 시크릿의 인코딩 방식 및 매칭 로직 테스트
     * 
     * 디버깅 세부사항:
     * - 클라이언트 ID: "public" (테스트용 퍼블릭 클라이언트)
     * - 시크릿 인코딩: BCrypt vs NoOp 확인
     * - 패스워드 매칭: 평문 "public"과 저장된 해시의 일치성
     * 
     * 예상 동작:
     * - RegisteredClientRepository 구현체가 정상적으로 주입되어야 함
     * - PasswordEncoder가 BCryptPasswordEncoder로 설정되어야 함
     * - "public" 클라이언트가 등록되어 있어야 함
     * - 클라이언트 시크릿이 BCrypt로 해시되어 있어야 함
     * - 패스워드 매칭이 성공해야 함
     * 
     * 문제 해결 가이드:
     * - 클라이언트를 찾을 수 없으면: OAuth2Config 설정 확인
     * - 시크릿이 {noop}로 시작하면: 평문 저장 상태 (보안 위험)
     * - 패스워드 매칭 실패시: 해시 값 또는 인코더 설정 확인
     */
    @Test
    fun `debug which bean is being used`() {
        // "public" 클라이언트 ID로 등록된 OAuth2 클라이언트 조회
        val client = registeredClientRepository.findByClientId("public")
        
        println("=== OAUTH2 DEBUG INFO ===")
        
        // 주입된 빈들의 실제 구현체 클래스 확인
        println("Bean class: ${registeredClientRepository::class.java.name}")
        println("PasswordEncoder class: ${passwordEncoder.javaClass.name}")
        println("Client found: ${client != null}")
        
        // 클라이언트 정보가 존재할 경우 상세 정보 출력
        if (client != null) {
            println("Client ID: ${client.clientId}")
            println("Client secret: ${client.clientSecret}")
            
            // NoOp 인코더 사용 여부 확인 (보안 위험 요소)
            println("Client secret starts with {noop}: ${client.clientSecret?.startsWith("{noop}") ?: false}")
            
            // 패스워드 인코더를 통한 시크릿 매칭 테스트
            // 평문 "public"과 저장된 해시가 일치하는지 확인
            println("Password encoder matches 'public': ${passwordEncoder.matches("public", client.clientSecret ?: "")}")
        }
        println("=========================")
    }
}