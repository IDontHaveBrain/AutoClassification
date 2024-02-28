package cc.nobrain.dev.userserver.domain.train.entity;

import cc.nobrain.dev.userserver.common.utils.CommonUtil;
import cc.nobrain.dev.userserver.domain.base.entity.File;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

import java.util.Objects;

@Entity
@DynamicUpdate
@DiscriminatorValue("TRAIN_FILE")
@Getter
@NoArgsConstructor
public class TrainFile extends File {
    @ManyToOne
    @JoinColumn(name = "owner_index")
    protected Member ownerIndex;

    @Override@JoinColumn
    public <T> void setRelation(T ownerEntity) {
        if (!(ownerEntity instanceof Member owner) || Objects.isNull(ownerEntity)) {
            throw new IllegalArgumentException("Invalid owner entity");
        }
        this.ownerIndex = owner;

        if (CommonUtil.isEmpty(owner.getTrainFiles())) {
            owner.initTrainFiles();
        }
        owner.getTrainFiles().add(this);
    }
}
