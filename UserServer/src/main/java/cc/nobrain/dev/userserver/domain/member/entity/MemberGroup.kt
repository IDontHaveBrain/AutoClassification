package cc.nobrain.dev.userserver.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.DynamicUpdate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@DynamicUpdate
@Getter
public class MemberGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String groupName;

    @Column
    private String groupDescription;

    @OneToMany(mappedBy = "memberGroup", fetch = FetchType.LAZY)
    private List<Member> members = new ArrayList<>();

    @OneToMany(mappedBy = "memberGroup", fetch = FetchType.LAZY)
    private Set<GroupPermissionMapping> groupPermissionMappings = new HashSet<>();
}
