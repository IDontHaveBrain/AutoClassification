package cc.nobrain.dev.userserver.domain.member.entity

import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
class MemberGroup(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(unique = true)
    val groupName: String,

    @Column
    val groupDescription: String,

    @OneToMany(mappedBy = "memberGroup", fetch = FetchType.LAZY)
    val members: MutableList<Member> = mutableListOf(),

    @OneToMany(mappedBy = "memberGroup", fetch = FetchType.LAZY)
    val groupPermissionMappings: MutableSet<GroupPermissionMapping> = mutableSetOf()
)
