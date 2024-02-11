package cc.nobrain.dev.userserver.domain.member.entity;

import cc.nobrain.dev.userserver.common.converter.BCryptoConverter;
import cc.nobrain.dev.userserver.common.validation.Name;
import cc.nobrain.dev.userserver.common.validation.Password;
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@DynamicUpdate
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = {@Index(name = "index_email",  columnList="email", unique = true)})
public class Member extends BaseCU implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Email
    @Column(unique = true, length = 50)
    private String email;

    @NotNull
    @Password
    @Column
    @Convert(converter = BCryptoConverter.class)
    private String password;

    @NotNull
    @Name
    @Column(length = 30, nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private MemberGroup memberGroup;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
        return authorities;
    }

    @Override
    public String getUsername() {
        return this.email;
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
