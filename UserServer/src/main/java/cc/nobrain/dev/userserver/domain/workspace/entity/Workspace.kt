package cc.nobrain.dev.userserver.domain.workspace.entity

import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import lombok.Getter
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
@Getter
class Workspace (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @field:NotNull
    @Column(nullable = false)
    var name: String,

    @Column
    var description: String? = null,

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    @field:NotNull
    var owner: Member,

    @OneToMany(mappedBy = "ownerIndex")
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
        members.add(member)
        member.workspace.add(this)
    }

    fun removeMember(member: Member) {
        members.remove(member)
        member.workspace.remove(this)
    }
}