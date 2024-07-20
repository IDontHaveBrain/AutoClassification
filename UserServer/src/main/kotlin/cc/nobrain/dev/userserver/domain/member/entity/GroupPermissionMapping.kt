package cc.nobrain.dev.userserver.domain.member.entity

import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
class GroupPermissionMapping(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_group_id")
    val memberGroup: MemberGroup,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_permission_id")
    val groupPermission: GroupPermission
)
