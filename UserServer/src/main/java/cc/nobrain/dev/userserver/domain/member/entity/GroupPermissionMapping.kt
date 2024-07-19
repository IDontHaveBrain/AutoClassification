package cc.nobrain.dev.userserver.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicUpdate
@Getter
public class GroupPermissionMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_group_id")
    private MemberGroup memberGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_permission_id")
    private GroupPermission groupPermission;
}
