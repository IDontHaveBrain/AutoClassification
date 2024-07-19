package cc.nobrain.dev.userserver.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.DynamicUpdate;

import java.util.HashSet;
import java.util.Set;

@Entity
@DynamicUpdate
@Getter
public class GroupPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String url;

    @Column
    private String httpMethod;

    @Column
    private String description;

    @OneToMany(mappedBy = "groupPermission", fetch = FetchType.LAZY)
    private Set<GroupPermissionMapping> groupPermissionMappings = new HashSet<>();

}
