package cc.nobrain.dev.userserver.common

/**
 * 성능 최적화를 위한 테스트 상수들
 * 
 * 이 상수들은 테스트 중 비용이 많이 드는 작업을 방지하는 데 도움이 됩니다.
 */
object TestConstants {
    
    /**
     * BCryptPasswordEncoder(10)으로 해시된 "123123!" 패스워드 ({bcrypt} 접두사 포함)
     * 테스트 멤버 생성 시 비용이 많이 드는 BCrypt 해싱을 방지합니다.
     * 
     * 생성 방법: BCryptPasswordEncoder(10).encode("123123!")
     * 해시: {bcrypt}$2a$10$T.go8qRa5a.jVTmXbg9MaOnGB1NIUF8.yd8yMX0a2NdmBkwAEAS1C
     */
    const val PRE_HASHED_TEST_PASSWORD = "{bcrypt}\$2a\$10\$T.go8qRa5a.jVTmXbg9MaOnGB1NIUF8.yd8yMX0a2NdmBkwAEAS1C"
    
    /**
     * PRE_HASHED_TEST_PASSWORD에 대응하는 평문 테스트 패스워드
     */
    const val TEST_PASSWORD_PLAIN = "123123!"
}