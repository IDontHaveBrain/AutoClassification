package cc.nobrain.dev.userserver.domain.base.entity

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
@DiscriminatorValue("TEMP_FILE")
class TempFile(
): File(){
    override fun <T : Any?> setRelation(ownerEntity: T) {
    }
}