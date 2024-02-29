package cc.nobrain.dev.userserver.domain.base.entity;

import cc.nobrain.dev.userserver.common.utils.GlobalUtil;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.OffsetDateTime;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@MappedSuperclass
@Getter
public abstract class BaseCU {
    @Column(updatable = false)
    private String createMember;

    @CreatedDate
    @Column(updatable = false)
    private OffsetDateTime createDateTime;

    private String updateMember;

    @LastModifiedDate
    private OffsetDateTime updateDateTime;

    @PrePersist
    protected void onCreate() {
        createDateTime = OffsetDateTime.now();
        updateDateTime = OffsetDateTime.now();
        createMember = GlobalUtil.getCurrentUserEmail();
        updateMember = GlobalUtil.getCurrentUserEmail();
    }

    @PreUpdate
    protected void onUpdate() {
        updateDateTime = OffsetDateTime.now();
        updateMember = GlobalUtil.getCurrentUserEmail();
    }
}
