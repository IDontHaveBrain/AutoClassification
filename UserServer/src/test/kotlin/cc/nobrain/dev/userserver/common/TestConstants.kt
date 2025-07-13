package cc.nobrain.dev.userserver.common

/**
 * Test constants for performance optimization.
 * 
 * These constants help avoid expensive operations during testing.
 */
object TestConstants {
    
    /**
     * Pre-hashed version of "123123!" using BCryptPasswordEncoder(10) with {bcrypt} prefix
     * This avoids expensive BCrypt hashing during test member creation.
     * 
     * Generated using: BCryptPasswordEncoder(10).encode("123123!")
     * Hash: {bcrypt}$2a$10$T.go8qRa5a.jVTmXbg9MaOnGB1NIUF8.yd8yMX0a2NdmBkwAEAS1C
     */
    const val PRE_HASHED_TEST_PASSWORD = "{bcrypt}\$2a\$10\$T.go8qRa5a.jVTmXbg9MaOnGB1NIUF8.yd8yMX0a2NdmBkwAEAS1C"
    
    /**
     * The plain text test password that corresponds to PRE_HASHED_TEST_PASSWORD
     */
    const val TEST_PASSWORD_PLAIN = "123123!"
}