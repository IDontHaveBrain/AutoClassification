package cc.nobrain.dev.userserver.member

import cc.nobrain.dev.userserver.UserServerApplication
import cc.nobrain.dev.userserver.common.TestSecurityConfig
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import cc.nobrain.dev.userserver.fixture.TestDataFactory
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import org.assertj.core.api.Assertions.assertThat
import org.springframework.test.annotation.DirtiesContext

@SpringBootTest(
    properties = [
        "spring.profiles.active=test",
        "spring.jpa.show-sql=false",
        "logging.level.org.hibernate.SQL=warn",
        "logging.level.org.hibernate.type.descriptor.sql.BasicBinder=warn",
        "management.health.mail.enabled=false"
    ],
    classes = [UserServerApplication::class, TestSecurityConfig::class]
)
@ActiveProfiles("test")
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MemberRepositoryTest {

    @Autowired
    private lateinit var memberRepository: MemberRepository

    @Autowired
    private lateinit var memberService: MemberService
    
    @Autowired
    private lateinit var testDataFactory: TestDataFactory

    @Test
    fun `should create and find test account using fixture`() {
        // Given: TestDataFactory를 사용하여 테스트 계정 생성
        val testEmail = "test@test.com"
        val testPassword = "123123!"
        
        val createdMember = testDataFactory.createTestMember(
            email = testEmail,
            password = testPassword,
            name = "Test User",
            isVerified = true
        )

        // When: 이메일로 멤버 검색
        val foundMember = memberRepository.findByEmail(testEmail)

        // Then: 멤버가 올바르게 찾아져야 함
        assertThat(foundMember).isNotNull
        assertThat(foundMember?.email).isEqualTo(testEmail)
        assertThat(foundMember?.name).isEqualTo("Test User")
        assertThat(foundMember?.id).isEqualTo(createdMember.id)
    }
    
    @Test
    fun `should verify member exists by email`() {
        // Given: 테스트 멤버 생성
        val testEmail = "exists@test.com"
        testDataFactory.createTestMember(email = testEmail)
        
        // When: 이메일 존재 여부 확인
        val exists = memberRepository.existsByEmail(testEmail)
        val notExists = memberRepository.existsByEmail("nonexistent@test.com")
        
        // Then: 올바른 결과가 반환되어야 함
        assertThat(exists).isTrue
        assertThat(notExists).isFalse
    }

    @Test
    fun `should delete test account`() {
        // Given: 테스트 멤버 생성
        val testEmail = "todelete@test.com"
        val member = testDataFactory.createTestMember(email = testEmail)
        
        // 멤버가 존재하는지 확인
        assertThat(memberRepository.existsByEmail(testEmail)).isTrue
        
        // When: 멤버 삭제
        memberRepository.delete(member)
        
        // Then: 멤버가 삭제되어야 함
        assertThat(memberRepository.existsByEmail(testEmail)).isFalse
        assertThat(memberRepository.findByEmail(testEmail)).isNull()
    }
}
