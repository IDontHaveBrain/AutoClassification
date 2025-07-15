package cc.nobrain.dev.userserver.fixture

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.MemberGroup

/**
 * Entity copy() 메서드 이슈 해결 예시
 * 
 * 이 파일은 JPA 엔티티에서 .copy() 메서드를 사용할 때 발생하는 문제와
 * 이를 해결하는 올바른 패턴을 보여줍니다.
 */
object CopyMethodFixExample {

    /**
     * ❌ 잘못된 패턴: JPA 엔티티에 .copy() 메서드 사용 (컴파일 에러 발생)
     * 
     * 다음과 같은 코드는 컴파일되지 않습니다:
     * 
     * fun problematicExample(baseMember: Member, newGroup: MemberGroup): Member {
     *     // ❌ 이 코드는 컴파일 에러를 발생시킵니다
     *     return baseMember.copy(memberGroup = newGroup)
     * }
     * 
     * 이유: Member는 JPA 엔티티 클래스이며 data class가 아니므로 copy() 메서드가 없습니다.
     */

    /**
     * ✅ 올바른 패턴 1: Fixture 클래스를 사용하여 새로운 엔티티 생성
     */
    fun correctPatternWithFixture(newGroup: MemberGroup): Member {
        return MemberFixtures.createMemberWithGroup(
            group = newGroup,
            email = "member@test.com",
            name = "Test Member"
        )
    }

    /**
     * ✅ 올바른 패턴 2: 직접 생성자를 사용하여 새로운 엔티티 생성
     */
    fun correctPatternWithConstructor(
        email: String,
        password: String,
        name: String,
        memberGroup: MemberGroup? = null
    ): Member {
        return Member(
            email = email,
            password = password,
            name = name,
            isVerified = true,
            memberGroup = memberGroup
        )
    }

    /**
     * ✅ 올바른 패턴 3: 기존 엔티티의 속성을 참조하여 새로운 엔티티 생성
     * (copy() 메서드의 의도를 구현하되, 직접 생성자 사용)
     */
    fun createSimilarMemberWithDifferentGroup(
        baseMember: Member,
        newGroup: MemberGroup
    ): Member {
        return Member(
            email = baseMember.email + ".copy", // 이메일은 유니크해야 하므로 수정
            password = baseMember.password,
            name = baseMember.name,
            isVerified = baseMember.isEnabled,
            memberGroup = newGroup
        )
    }

    /**
     * 실제 사용 예시: TestDataFactory에서 활용 방법
     */
    fun exampleUsageInTests() {
        // 1. 기본 그룹 생성
        val adminGroup = MemberGroupFixtures.createAdminGroup()
        val userGroup = MemberGroupFixtures.createUserGroup()

        // 2. 다양한 방법으로 멤버 생성
        val admin = correctPatternWithConstructor(
            email = "admin@test.com",
            password = "admin123!",
            name = "Admin User",
            memberGroup = adminGroup
        )

        val user = correctPatternWithFixture(userGroup)

        // 3. 기존 멤버를 참조하여 유사한 멤버 생성 (copy() 대신)
        val similarUser = createSimilarMemberWithDifferentGroup(user, adminGroup)

        // 이제 모든 엔티티가 올바르게 생성되었습니다!
    }

    /**
     * 라인 1044, 1053 등에서 발생했을 수 있는 문제 시뮬레이션
     * 
     * 원래 문제가 있었던 코드는 다음과 같았을 것입니다:
     * 
     * // 라인 1044 근처
     * val updatedMember = existingMember.copy(memberGroup = newGroup)  // ❌ 컴파일 에러
     * 
     * // 라인 1053 근처  
     * val modifiedMember = member.copy(isVerified = true)  // ❌ 컴파일 에러
     * 
     * 이를 다음과 같이 수정해야 합니다:
     */
    fun fixedLine1044Example(existingMember: Member, newGroup: MemberGroup): Member {
        // ✅ 수정된 코드
        return Member(
            email = existingMember.email,
            password = existingMember.password,
            name = existingMember.name,
            isVerified = existingMember.isEnabled,
            memberGroup = newGroup  // 새로운 그룹으로 변경
        )
    }

    fun fixedLine1053Example(member: Member): Member {
        // ✅ 수정된 코드
        return Member(
            email = member.email,
            password = member.password,
            name = member.name,
            isVerified = true,  // 인증 상태 변경
            memberGroup = member.memberGroup
        )
    }
}