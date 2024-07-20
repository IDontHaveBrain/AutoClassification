package cc.nobrain.dev.userserver.domain.alarm.entity;

import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import jakarta.persistence.*;
import org.hibernate.annotations.DynamicUpdate;

import java.time.OffsetDateTime;

@Entity
@DynamicUpdate
class AlarmRead(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long? = null,

        @ManyToOne
        @JoinColumn(name = "member_id")
        val reader: Member? = null,

        @ManyToOne
        @JoinColumn(name = "alarm_id")
        val alarmMessage: AlarmMessage? = null,
) : BaseCU() {
        @Column
        var readYn: Boolean = true

        @Column
        var deleteYn: Boolean = false

        @Column
        var readAt: OffsetDateTime? = OffsetDateTime.now()

        @Column
        var deleteAt: OffsetDateTime? = null

        fun read() {
                this.readYn = true
                this.readAt = OffsetDateTime.now()
        }
}
