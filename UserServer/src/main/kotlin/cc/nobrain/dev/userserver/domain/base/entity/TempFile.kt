package cc.nobrain.dev.userserver.domain.base.entity

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.domain.member.entity.Member
import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
@DiscriminatorValue("TEMP_FILE")
class TempFile(
    @ManyToOne
    @JoinColumn(name = "ownerIndex", foreignKey = ForeignKey(name = "fk_ownerIndex", value = ConstraintMode.NO_CONSTRAINT))
    var ownerIndex: Member? = null,
): File(){

    override fun <T : Any?> setRelation(ownerEntity: T) {
        if (ownerEntity !is Member) {
            throw CustomException(ErrorInfo.TARGET_NOT_FOUND)
        }
        this.ownerIndex = ownerEntity;
        ownerEntity.tempFiles.add(this);
    }
}