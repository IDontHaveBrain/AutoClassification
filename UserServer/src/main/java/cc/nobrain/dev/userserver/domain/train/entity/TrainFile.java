package cc.nobrain.dev.userserver.domain.train.entity;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
    protected Workspace ownerIndex;

    @Override
    public <T> void setRelation(T ownerEntity) {
        if (!(ownerEntity instanceof Workspace owner) || Objects.isNull(ownerEntity)) {
            throw new IllegalArgumentException("Invalid owner entity");
        }
        this.ownerIndex = owner;
        owner.getFiles().add(this);
    }
}
