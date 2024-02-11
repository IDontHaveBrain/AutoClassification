package cc.nobrain.dev.userserver.domain.alarm.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicUpdate
@Getter
@DiscriminatorValue("ALL")
public class AlarmTargetAll extends AlarmTarget {
}
