package cc.nobrain.dev.userserver.domain.member.entity;

import cc.nobrain.dev.userserver.common.converter.BCryptoConverter;
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import cc.nobrain.dev.userserver.domain.base.entity.TempFile;
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy;
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile;
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Entity
@Getter
@DynamicUpdate
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = {@Index(name = "index_email", columnList = "email", unique = true)})
public class Member extends BaseCU implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Email
    @Column(unique = true, length = 50)
    private String email;

    @NotNull
//    @Password()
    @Column
    @Convert(converter = BCryptoConverter.class)
    private String password;

    @NotNull
//    @Name
    @Column(length = 30, nullable = false)
    private String name;

    @Column(columnDefinition = "boolean default false")
    @NotNull
    private Boolean isVerified = false;

    @Column
    private String tempToken;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private MemberGroup memberGroup;

    @ManyToMany(mappedBy = "members")
    private List<Workspace> workspace = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Classfiy> classfiy = new ArrayList<>();

    @OneToMany(mappedBy = "ownerIndex")
    private List<TempFile> tempFiles = new ArrayList<>();

    public String generateTempToken() {
        this.tempToken = UUID.randomUUID().toString();
        return this.tempToken;
    }

    public void verify() {
        this.isVerified = true;
        tempToken = null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
        return authorities;
    }

    public String getName() {
        return this.name;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
