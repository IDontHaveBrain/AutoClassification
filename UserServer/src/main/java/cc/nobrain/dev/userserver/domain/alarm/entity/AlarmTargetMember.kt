package cc.nobrain.dev.userserver.domain.alarm.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicUpdate
@DiscriminatorValue("MEMBER")
class AlarmTargetMember : AlarmTarget() {
}
