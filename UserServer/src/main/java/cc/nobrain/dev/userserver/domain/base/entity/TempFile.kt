package cc.nobrain.dev.userserver.domain.base.entity

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.domain.member.entity.Member
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import jakarta.persistence.ManyToOne
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
@DiscriminatorValue("TEMP_FILE")
class TempFile(
    @ManyToOne
    var ownerIndex: Member,
): File(){

    override fun <T : Any?> setRelation(ownerEntity: T) {
        if (ownerEntity !is Member) {
            throw CustomException(ErrorInfo.TARGET_NOT_FOUND)
        }
        this.ownerIndex = ownerEntity;
        ownerEntity.tempFiles.add(this);
    }
}