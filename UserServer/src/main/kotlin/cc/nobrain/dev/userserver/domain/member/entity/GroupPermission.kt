package cc.nobrain.dev.userserver.domain.member.entity

import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
class GroupPermission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(unique = true, nullable = false)
    val url: String,

    @Column
    val httpMethod: String,

    @Column
    val description: String,

    @OneToMany(mappedBy = "groupPermission", fetch = FetchType.LAZY)
    val groupPermissionMappings: MutableSet<GroupPermissionMapping> = mutableSetOf()
)
