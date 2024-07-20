package cc.nobrain.dev.userserver.domain.alarm.entity

import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import jakarta.persistence.*
import org.hibernate.annotations.DynamicUpdate

@DynamicUpdate
@Entity
class AlarmMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column
    var title: String? = null,

    @Column
    var content: String? = null,

    @Column(nullable = true)
    var link: String? = null,

    @Column
    @Enumerated(EnumType.STRING)
    var eventType: AlarmEventType? = null,

    @OneToMany(mappedBy = "alarmMessage", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    var alarmTarget: MutableList<AlarmTarget> = mutableListOf(),

    @OneToMany(mappedBy = "alarmMessage", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    var alarmRead: MutableList<AlarmRead> = mutableListOf()
) : BaseCU() {
}
