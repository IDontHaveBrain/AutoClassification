package cc.nobrain.dev.userserver.domain.workspace.entity

import cc.nobrain.dev.userserver.common.converter.StringListConverter
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
class Workspace (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @field:NotNull
    @Column(nullable = false)
    var name: String,

    @Column
    var description: String? = null,

    @Convert(converter = StringListConverter::class)
    var classes: List<String>? = null,

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    var owner: Member,

    @OneToMany(mappedBy = "ownerIndex", cascade = [CascadeType.ALL])
    var files: MutableList<TrainFile> = ArrayList(),

    @ManyToMany
    @JoinTable(
        name = "workspace_member",
        joinColumns = [JoinColumn(name = "workspace_id")],
        inverseJoinColumns = [JoinColumn(name = "member_id")]
    )
    var members: MutableList<Member> = ArrayList(),
): BaseCU() {
    fun addMember(member: Member) {
        if (members.isNullOrEmpty()) {
            members = ArrayList()
        }
        members.add(member)
        member.workspace.add(this)
    }

    fun removeMember(member: Member) {
        members.remove(member)
        member.workspace.remove(this)
    }

    fun changeClasses(classes: List<String>) {
        this.classes = classes
    }
}