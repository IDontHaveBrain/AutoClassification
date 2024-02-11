package cc.nobrain.dev.userserver.domain.alarm.entity;


import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType;
import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmTargetType;
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import jakarta.persistence.*;
import org.hibernate.annotations.DynamicUpdate;

import java.util.List;


@DynamicUpdate
@Entity
public class Alarm extends BaseCU {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String title;

    @Column
    private String content;

    @Column
    @Enumerated(EnumType.STRING)
    private AlarmEventType eventType;

    @OneToMany(mappedBy = "alarm", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<AlarmTarget> alarmTarget;

    @OneToMany(mappedBy = "alarm", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<AlarmRead> alarmRead;
}
