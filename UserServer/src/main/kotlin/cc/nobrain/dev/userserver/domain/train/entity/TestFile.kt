package cc.nobrain.dev.userserver.domain.train.entity

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.domain.base.entity.File
import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
@DiscriminatorValue("TEST_FILE")
class TestFile(
    @ManyToOne
    @JoinColumn(name = "ownerIndex", foreignKey = ForeignKey(name = "fk_ownerIndex", value = ConstraintMode.NO_CONSTRAINT))
    var ownerIndex: Classfiy? = null,
): File() {

    override fun <T : Any?> setRelation(ownerEntity: T) {
        if (ownerEntity == null || ownerEntity !is Classfiy) {
            throw CustomException(ErrorInfo.TARGET_NOT_FOUND)
        }
        this.ownerIndex = ownerEntity;
        ownerEntity.testFiles.add(this);
    }
}