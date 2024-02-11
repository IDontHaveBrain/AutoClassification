package cc.nobrain.dev.userserver.domain.alarm.entity;

import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import jakarta.persistence.*;
import org.hibernate.annotations.DynamicUpdate;

import java.time.OffsetDateTime;

@Entity
@DynamicUpdate
public class AlarmRead extends BaseCU {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member reader;

    @ManyToOne
    @JoinColumn(name = "alarm_id")
    private Alarm alarm;

    @Column
    private boolean readYn;

    @Column
    private boolean deleteYn;

    @Column
    private OffsetDateTime readAt;

    @Column
    private OffsetDateTime deleteAt;
}
