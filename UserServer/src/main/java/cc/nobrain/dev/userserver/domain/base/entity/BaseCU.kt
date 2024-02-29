package cc.nobrain.dev.userserver.domain.base.entity

import cc.nobrain.dev.userserver.common.utils.MemberUtil
import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import lombok.AccessLevel
import lombok.Getter
import lombok.NoArgsConstructor
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import java.time.OffsetDateTime


@MappedSuperclass
@Getter
abstract class BaseCU {
    @Column(updatable = false)
    var createMember: String? = null
        protected set

    @CreatedDate
    @Column(updatable = false)
    var createDateTime: OffsetDateTime? = null
        protected set

    var updateMember: String? = null
        protected set

    @LastModifiedDate
    var updateDateTime: OffsetDateTime? = null
        protected set

    @PrePersist
    protected fun onCreate() {
        createDateTime = OffsetDateTime.now()
        updateDateTime = OffsetDateTime.now()
        createMember = MemberUtil.getCurrentUserEmail()
        updateMember = MemberUtil.getCurrentUserEmail()
    }

    @PreUpdate
    protected fun onUpdate() {
        updateDateTime = OffsetDateTime.now()
        updateMember = MemberUtil.getCurrentUserEmail()
    }
}