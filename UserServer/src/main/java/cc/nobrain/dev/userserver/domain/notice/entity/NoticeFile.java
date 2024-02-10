package cc.nobrain.dev.userserver.domain.notice.entity;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import org.hibernate.annotations.DynamicUpdate;

import java.util.Objects;

@Entity
@DynamicUpdate
@DiscriminatorValue("NOTICE_FILE")
@Getter
public class NoticeFile extends File {

    @ManyToOne
    @JoinColumn(name = "owner_index")
    private Notice ownerIndex;

    @Override
    public <T> void setRelation(T ownerEntity) {
        if (!(ownerEntity instanceof Notice owner) || Objects.isNull(ownerEntity)) {
            throw new IllegalArgumentException("Invalid owner entity");
        }
        this.ownerIndex = owner;
        owner.getAttachedFiles().add(this);
    }
}
