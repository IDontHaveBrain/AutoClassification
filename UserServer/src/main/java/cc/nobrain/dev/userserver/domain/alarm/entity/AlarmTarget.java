package cc.nobrain.dev.userserver.domain.alarm.entity;

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.entity.MemberGroup;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DiscriminatorOptions;
import org.hibernate.annotations.DynamicUpdate;

@DynamicUpdate
@Entity
@Getter
@DiscriminatorColumn(name = "targetType")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorOptions(force = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class AlarmTarget extends BaseCU {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(insertable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    private AlarmTargetType targetType;

    @ManyToOne
    @JoinColumn(name = "alarm_id")
    private Alarm alarm;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member targetMember;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private MemberGroup targetGroup;



}
