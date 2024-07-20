package cc.nobrain.dev.userserver.domain.train.entity;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

import java.util.Objects;

@Entity
@DynamicUpdate
@DiscriminatorValue("TRAIN_FILE")
class TrainFile(
    @ManyToOne
    @JoinColumn(name = "ownerIndex", foreignKey = ForeignKey(name = "fk_ownerIndex", value = ConstraintMode.NO_CONSTRAINT))
    var ownerIndex: Workspace? = null,

    @Column(nullable = false, columnDefinition = "varchar(255) default 'none'")
    var label: String = "none",
) : File() {
    override fun <T> setRelation(ownerEntity: T) {
        if (ownerEntity == null || ownerEntity !is Workspace) {
            throw IllegalArgumentException("Invalid owner entity")
        }
        this.ownerIndex = ownerEntity
        if (ownerEntity.files.isNullOrEmpty()) {
            ownerEntity.files = mutableListOf()
        }
        ownerEntity.files.add(this)
    }
}