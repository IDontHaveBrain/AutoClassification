package cc.nobrain.dev.userserver

import org.junit.jupiter.api.Test
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.util.Base64

/**
 * RSA 키 페어 생성 유틸리티 테스트 클래스
 * 
 * JWT 토큰 서명 및 검증을 위한 RSA 공개/개인 키 페어를 생성하는 유틸리티입니다.
 * Spring Security JWT 인프라에서 사용할 RSA 키를 생성하고 Base64로 인코딩하여 출력합니다.
 * 
 * 주요 기능:
 * - 2048비트 RSA 키 페어 생성
 * - 공개키/개인키 Base64 인코딩
 * - JWT 서명용 키 포맷 출력
 * - 환경변수 설정용 키 값 제공
 * 
 * RSA 암호화 기술 세부사항:
 * - 키 길이: 2048비트 (보안 권장 사항)
 * - 알고리즘: RSA (Rivest-Shamir-Adleman)
 * - 키 포맷: PKCS#8 (개인키), X.509 (공개키)
 * - 인코딩: Base64 (환경변수 저장 호환성)
 * 
 * JWT 토큰 서명 프로세스:
 * 1. 개인키로 JWT 토큰 서명 생성
 * 2. 공개키로 JWT 토큰 서명 검증
 * 3. 비대칭 암호화를 통한 토큰 무결성 보장
 * 
 * 보안 고려사항:
 * - 개인키는 절대 노출되어서는 안 됨
 * - 공개키는 클라이언트에 배포 가능
 * - 키 순환(rotation) 정책 필요
 * - 프로덕션에서는 HSM 또는 키 관리 서비스 사용 권장
 * 
 * 사용 방법:
 * 1. 이 테스트 실행
 * 2. 출력된 키 값들을 환경변수에 설정
 * 3. JWT_PRIVATE_KEY, JWT_PUBLIC_KEY 환경변수로 사용
 * 
 * 성능 특성:
 * - Spring Boot 컨텍스트 불필요 (빠른 실행)
 * - 키 생성은 CPU 집약적 작업
 * - 일회성 실행 후 키 재사용 권장
 * 
 * @see java.security.KeyPairGenerator
 * @see java.security.KeyPair
 * @see cc.nobrain.dev.userserver.common.component.RsaHelper
 * @see cc.nobrain.dev.userserver.common.security.SecurityConfig
 */
class RsaKeyGeneratorUtilTest {

    /**
     * RSA 키 페어 생성 및 Base64 인코딩 테스트
     * 
     * JWT 토큰 서명에 사용할 RSA 키 페어를 생성하고 Base64로 인코딩하여 출력합니다.
     * 생성된 키는 환경변수나 설정 파일에 저장하여 JWT 인프라에서 사용할 수 있습니다.
     * 
     * 실행 순서:
     * 1. 2048비트 RSA 키 페어 생성
     * 2. 공개키를 X.509 포맷으로 인코딩
     * 3. 개인키를 PKCS#8 포맷으로 인코딩
     * 4. Base64로 문자열 변환하여 출력
     * 
     * 출력 형태:
     * - Public: [Base64 인코딩된 공개키]
     * - Private: [Base64 인코딩된 개인키]
     * 
     * 보안 주의사항:
     * - 출력된 개인키는 즉시 안전한 곳에 저장하고 콘솔 로그는 삭제
     * - 공개키는 JWT 검증용으로 클라이언트에 배포 가능
     * - 키 순환 주기에 따라 정기적으로 새 키 생성 필요
     * 
     * 환경변수 설정 예시:
     * JWT_PUBLIC_KEY=[생성된 공개키]
     * JWT_PRIVATE_KEY=[생성된 개인키]
     */
    @Test
    fun gen() {
        // RSA 키 페어 생성
        val keyPair = generateRsaKey()

        // 공개키와 개인키를 Base64로 인코딩
        val encodedPublicKey = Base64.getEncoder().encodeToString(keyPair.public.encoded)
        val encodedPrivateKey = Base64.getEncoder().encodeToString(keyPair.private.encoded)

        // 환경변수 설정용 키 값 출력
        println("공개키 : $encodedPublicKey")
        println("개인키 : $encodedPrivateKey")

        println("완료")
    }

    /**
     * 2048비트 RSA 키 페어 생성 헬퍼 함수
     * 
     * Java Security API를 사용하여 암호학적으로 안전한 RSA 키 페어를 생성합니다.
     * 
     * 기술적 세부사항:
     * - 알고리즘: RSA (Rivest-Shamir-Adleman)
     * - 키 길이: 2048비트 (현재 보안 표준)
     * - 키 생성기: Java 표준 KeyPairGenerator
     * - 난수 생성: 시스템의 SecureRandom 사용
     * 
     * 키 길이 선택 기준:
     * - 1024비트: 더 이상 안전하지 않음 (deprecated)
     * - 2048비트: 현재 권장 최소 길이
     * - 4096비트: 더 높은 보안, 하지만 성능 저하
     * 
     * @return 생성된 RSA 키 페어 (공개키 + 개인키)
     * @throws IllegalStateException 키 생성 실패시
     */
    private fun generateRsaKey(): KeyPair {
        return try {
            // RSA 키 페어 생성기 초기화
            val keyPairGenerator = KeyPairGenerator.getInstance("RSA")
            keyPairGenerator.initialize(2048) // 2048비트 키 길이 설정
            keyPairGenerator.generateKeyPair() // 키 페어 생성 및 반환
        } catch (ex: Exception) {
            throw IllegalStateException("RSA 키 페어 생성 중 오류 발생", ex)
        }
    }
}
