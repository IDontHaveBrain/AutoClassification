package cc.nobrain.dev.userserver.domain.base.entity;

import cc.nobrain.dev.userserver.common.utils.MemberUtil;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@MappedSuperclass
@Getter
@EntityListeners(AuditingEntityListener.class)
@SuperBuilder
public abstract class BaseCU {

    @CreatedBy
    @Column(updatable = false)
    private String createMember;

    @CreatedDate
    @Column(updatable = false)
    private OffsetDateTime createDateTime;

    @LastModifiedBy
    private String updateMember;

    @LastModifiedDate
    private OffsetDateTime updateDateTime;

//    @PrePersist
//    protected void onCreate() {
//        createDateTime = OffsetDateTime.now();
//        updateDateTime = OffsetDateTime.now();
//        createMember = MemberUtil.getCurrentUserEmail();
//        updateMember = MemberUtil.getCurrentUserEmail();
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updateDateTime = OffsetDateTime.now();
//        updateMember = MemberUtil.getCurrentUserEmail();
//    }
}
