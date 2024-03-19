package cc.nobrain.dev.userserver.domain.alarm.entity;


import cc.nobrain.dev.userserver.domain.alarm.enums.AlarmEventType;
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

import java.util.List;


@DynamicUpdate
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlarmMessage extends BaseCU {

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

    @OneToMany(mappedBy = "alarmMessage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<AlarmTarget> alarmTarget;

    @OneToMany(mappedBy = "alarmMessage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<AlarmRead> alarmRead;
}
