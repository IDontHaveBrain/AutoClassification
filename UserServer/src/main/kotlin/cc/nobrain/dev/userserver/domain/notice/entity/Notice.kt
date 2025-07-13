package cc.nobrain.dev.userserver.domain.notice.entity

import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

@Entity
class Notice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @NotNull
    @Column(nullable = false)
    var title: String,

    @NotNull
    @Column(columnDefinition = "TEXT", length = 2000, nullable = false)
    var content: String,

    @Column(columnDefinition = "boolean default false")
    var sticky: Boolean = false,

    @Size(max = 5)
    @OneToMany(mappedBy = "ownerIndex", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, orphanRemoval = true)
    var attachments: MutableList<NoticeFile> = mutableListOf()
) : BaseCU() {

    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    fun addFile(file: NoticeFile) {
        if (!attachments.contains(file)) {
            file.setRelation(this)
        }
    }
}
