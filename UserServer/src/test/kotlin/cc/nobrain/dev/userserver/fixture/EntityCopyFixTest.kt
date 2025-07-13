package cc.nobrain.dev.userserver.fixture

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.MemberGroup
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName

/**
 * JPA 엔티티 copy() 메서드 이슈 해결 테스트
 * 
 * 문제점: JPA 엔티티는 data class가 아니므로 .copy() 메서드가 없음
 * 해결책: 적절한 생성자 패턴과 fixture 클래스 사용
 */
class EntityCopyFixTest {

    @Test
    @DisplayName("Member 엔티티는 copy() 메서드 대신 적절한 생성자 패턴을 사용해야 함")
    fun shouldCreateMemberEntitiesWithoutCopyMethod() {
        // Given: 기본 멤버 그룹 생성
        val userGroup = MemberGroupFixtures.createUserGroup()
        
        // When: copy() 메서드 대신 fixture를 사용하여 멤버 생성
        val member1 = MemberFixtures.createTestMember(
            email = "member1@test.com",
            name = "Member 1",
            memberGroup = userGroup
        )
        
        val member2 = MemberFixtures.createMemberWithGroup(
            group = userGroup,
            email = "member2@test.com",
            name = "Member 2"
        )
        
        // Then: 엔티티가 올바르게 생성되었는지 확인
        assertThat(member1.email).isEqualTo("member1@test.com")
        assertThat(member1.name).isEqualTo("Member 1")
        assertThat(member1.memberGroup).isEqualTo(userGroup)
        
        assertThat(member2.email).isEqualTo("member2@test.com")
        assertThat(member2.name).isEqualTo("Member 2")
        assertThat(member2.memberGroup).isEqualTo(userGroup)
    }
    
    @Test
    @DisplayName("Member 엔티티 생성 시 copy() 메서드 없이도 다양한 변형을 만들 수 있어야 함")
    fun shouldCreateVariationsWithoutCopyMethod() {
        // Given: 기본 데이터
        val adminGroup = MemberGroupFixtures.createAdminGroup()
        val userGroup = MemberGroupFixtures.createUserGroup()
        
        // When: copy() 메서드 대신 생성자를 사용하여 다양한 멤버 생성
        val admin = MemberFixtures.createAdminMember(memberGroup = adminGroup)
        val user = MemberFixtures.createTestMember(memberGroup = userGroup)
        val unverified = MemberFixtures.createUnverifiedMember()
        
        // Then: 각 엔티티가 올바르게 생성되었는지 확인
        assertThat(admin.memberGroup).isEqualTo(adminGroup)
        assertThat(admin.email).isEqualTo("admin@test.com")
        
        assertThat(user.memberGroup).isEqualTo(userGroup)
        assertThat(user.email).isEqualTo("test@test.com")
        
        assertThat(unverified.memberGroup).isNull()
        assertThat(unverified.email).isEqualTo("unverified@test.com")
    }
    
    @Test
    @DisplayName("동일한 기본 데이터를 사용하여 다른 속성의 멤버들을 생성할 수 있어야 함")
    fun shouldCreateDifferentMembersFromSameBase() {
        // Given: 공통 그룹
        val commonGroup = MemberGroupFixtures.createTestGroup()
        
        // When: 같은 그룹으로 다른 속성의 멤버들 생성 (copy() 패턴을 생성자로 대체)
        val member1 = MemberFixtures.createMemberWithGroup(
            group = commonGroup,
            email = "variation1@test.com",
            name = "Variation 1"
        )
        
        val member2 = MemberFixtures.createMemberWithGroup(
            group = commonGroup,
            email = "variation2@test.com", 
            name = "Variation 2"
        )
        
        val member3 = MemberFixtures.createMemberWithGroup(
            group = commonGroup,
            email = "variation3@test.com",
            name = "Variation 3"
        )
        
        // Then: 모든 멤버가 같은 그룹에 속하지만 다른 속성을 가져야 함
        assertThat(member1.memberGroup).isEqualTo(commonGroup)
        assertThat(member2.memberGroup).isEqualTo(commonGroup)
        assertThat(member3.memberGroup).isEqualTo(commonGroup)
        
        // 각자 고유한 정보를 가져야 함
        val emails = listOf(member1.email, member2.email, member3.email)
        val names = listOf(member1.name, member2.name, member3.name)
        
        assertThat(emails).hasSize(3)
        assertThat(emails.toSet()).hasSize(3) // 모든 이메일이 고유
        assertThat(names).hasSize(3)
        assertThat(names.toSet()).hasSize(3) // 모든 이름이 고유
    }
    
    @Test
    @DisplayName("JPA 엔티티는 data class가 아니므로 copy 메서드가 존재하지 않음을 확인")
    fun verifyEntityIsNotDataClass() {
        // Given: Member 엔티티 생성
        val member = MemberFixtures.createTestMember()
        
        // When: Member 클래스에 copy 메서드가 있는지 확인
        val memberClass = member.javaClass
        val methods = memberClass.methods
        val copyMethod = methods.find { it.name == "copy" }
        
        // Then: copy 메서드가 존재하지 않아야 함 (JPA 엔티티는 data class가 아님)
        assertThat(copyMethod).isNull()
    }
}