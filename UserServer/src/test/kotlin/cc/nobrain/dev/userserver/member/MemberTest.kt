package cc.nobrain.dev.userserver.member

import cc.nobrain.dev.userserver.common.component.RsaHelper
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.member.service.MemberService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class MemberRepositoryTest {

    @Autowired
    lateinit var memberRepository: MemberRepository

    @Autowired
    lateinit var memberService: MemberService

    @Test
    fun setupTestAccount() {
        val testEmail = "test@test.com"
        val testPassword = "123123!"

        if (!memberRepository.existsByEmail(testEmail)) {
            val newMember = Member(
                email = testEmail,
                password = testPassword,
                name = "Test User",
                isVerified = true
            )
            memberRepository.save(newMember)
            println("Test account created: $testEmail")
        } else {
            println("Test account already exists: $testEmail")
        }

        val member = memberRepository.findByEmail(testEmail)
        assertThat(member).isNotNull
    }

    @Test
    fun deleteTestAccount() {
        val testEmail = "test@test.com"
        val member = memberRepository.findByEmail(testEmail)
        if (member != null) {
            memberRepository.delete(member)
            println("Test account deleted: $testEmail")
        } else {
            println("Test account not found: $testEmail")
        }
    }
}
