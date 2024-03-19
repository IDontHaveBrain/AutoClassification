package cc.nobrain.dev.userserver.domain.alarm.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicUpdate
@DiscriminatorValue("GROUP")
class AlarmTargetGroup : AlarmTarget() {
}
