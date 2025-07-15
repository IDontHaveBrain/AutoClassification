package cc.nobrain.dev.userserver.fixture

import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.MemberGroup

/**
 * Member 엔티티 생성을 위한 Fixture 클래스
 * JPA 엔티티는 data class가 아니므로 .copy() 메서드 대신 적절한 생성자 패턴을 사용
 */
object MemberFixtures {

    /**
     * 기본 테스트 멤버 생성
     */
    fun createTestMember(
        id: Long? = null,
        email: String = "test@test.com",
        password: String = "123123!",
        name: String = "Test User",
        isVerified: Boolean = true,
        memberGroup: MemberGroup? = null
    ): Member {
        return Member(
            id = id,
            email = email,
            password = password,
            name = name,
            isVerified = isVerified,
            memberGroup = memberGroup
        )
    }

    /**
     * 관리자 멤버 생성
     */
    fun createAdminMember(
        id: Long? = null,
        email: String = "admin@test.com",
        password: String = "admin123!",
        name: String = "Admin User",
        memberGroup: MemberGroup? = null
    ): Member {
        return Member(
            id = id,
            email = email,
            password = password,
            name = name,
            isVerified = true,
            memberGroup = memberGroup
        )
    }

    /**
     * 미인증 멤버 생성
     */
    fun createUnverifiedMember(
        id: Long? = null,
        email: String = "unverified@test.com",
        password: String = "test123!",
        name: String = "Unverified User"
    ): Member {
        return Member(
            id = id,
            email = email,
            password = password,
            name = name,
            isVerified = false
        )
    }

    /**
     * 그룹과 함께 멤버 생성
     */
    fun createMemberWithGroup(
        group: MemberGroup,
        id: Long? = null,
        email: String = "member@test.com",
        password: String = "member123!",
        name: String = "Group Member"
    ): Member {
        return Member(
            id = id,
            email = email,
            password = password,
            name = name,
            isVerified = true,
            memberGroup = group
        )
    }
}

/**
 * MemberGroup 엔티티 생성을 위한 Fixture 클래스
 */
object MemberGroupFixtures {

    /**
     * 기본 테스트 그룹 생성
     */
    fun createTestGroup(
        id: Long? = null,
        groupName: String = "Test Group",
        groupDescription: String = "Test group description"
    ): MemberGroup {
        return MemberGroup(
            id = id,
            groupName = groupName,
            groupDescription = groupDescription
        )
    }

    /**
     * 관리자 그룹 생성
     */
    fun createAdminGroup(
        id: Long? = null,
        groupName: String = "Admin Group",
        groupDescription: String = "Administrator group"
    ): MemberGroup {
        return MemberGroup(
            id = id,
            groupName = groupName,
            groupDescription = groupDescription
        )
    }

    /**
     * 사용자 그룹 생성
     */
    fun createUserGroup(
        id: Long? = null,
        groupName: String = "User Group",
        groupDescription: String = "Regular user group"
    ): MemberGroup {
        return MemberGroup(
            id = id,
            groupName = groupName,
            groupDescription = groupDescription
        )
    }
}