package cc.nobrain.dev.userserver.domain.train.entity

import cc.nobrain.dev.userserver.common.converter.StringListConverter
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import cc.nobrain.dev.userserver.domain.member.entity.Member
import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
class Classfiy(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    var member: Member,

    @Column
    @Convert(converter = StringListConverter::class)
    var classes: MutableList<String> = mutableListOf(),

    @Column(columnDefinition = "TEXT")
    var resultJson: String = "",

    @OneToMany(mappedBy = "ownerIndex")
    var testFiles: MutableList<TestFile> = mutableListOf(),
): BaseCU() {
}