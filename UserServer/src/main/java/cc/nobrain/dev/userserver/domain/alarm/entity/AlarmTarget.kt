package cc.nobrain.dev.userserver.domain.alarm.entity;

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.entity.MemberGroup
import jakarta.persistence.*
import org.hibernate.annotations.DiscriminatorOptions
import org.hibernate.annotations.DynamicUpdate

@DynamicUpdate
@Entity
@DiscriminatorColumn(name = "targetType")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorOptions(force = true)
abstract class AlarmTarget (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(insertable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    var targetType: AlarmTargetType? = null,

    @ManyToOne
    @JoinColumn(name = "alarm_message_id")
    var alarmMessage: AlarmMessage? = null,

    @ManyToOne
    @JoinColumn(name = "member_id")
    var targetMember: Member? = null,

    @ManyToOne
    @JoinColumn(name = "group_id")
    var targetGroup: MemberGroup? = null
) : BaseCU() {
}
