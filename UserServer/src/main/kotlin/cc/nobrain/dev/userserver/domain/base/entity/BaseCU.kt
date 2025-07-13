package cc.nobrain.dev.userserver.domain.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseCU {

    @CreatedBy
    @Column(updatable = false)
    var createMember: String? = null

    @CreatedDate
    @Column(updatable = false)
    var createDateTime: OffsetDateTime? = null

    @LastModifiedBy
    var updateMember: String? = null

    @LastModifiedDate
    var updateDateTime: OffsetDateTime? = null
}
