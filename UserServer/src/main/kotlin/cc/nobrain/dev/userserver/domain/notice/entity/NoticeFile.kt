package cc.nobrain.dev.userserver.domain.notice.entity;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate;

import java.util.Objects;

@Entity
@DynamicUpdate
@DiscriminatorValue("NOTICE_FILE")
class NoticeFile(
    @ManyToOne
    @JoinColumn(name = "ownerIndex", foreignKey = ForeignKey(name = "fk_ownerIndex", value = ConstraintMode.NO_CONSTRAINT))
    var ownerIndex: Notice? = null
) : File() {

    override fun <T> setRelation(ownerEntity: T) {
        if (ownerEntity !is Notice || ownerEntity == null) {
            throw IllegalArgumentException("Invalid owner entity")
        }
        this.ownerIndex = ownerEntity
        ownerEntity.attachments.add(this)
    }
}
