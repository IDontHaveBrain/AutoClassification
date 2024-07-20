package cc.nobrain.dev.userserver.domain.member.entity

import cc.nobrain.dev.userserver.common.converter.BCryptoConverter
import cc.nobrain.dev.userserver.domain.base.entity.BaseCU
import cc.nobrain.dev.userserver.domain.base.entity.TempFile
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotNull
import org.hibernate.annotations.DynamicUpdate
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.*

@Entity
@DynamicUpdate
@Table(indexes = [Index(name = "index_email", columnList = "email", unique = true)])
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @NotNull @Email
    @Column(unique = true, length = 50)
    val email: String,

    @NotNull
    @Column
    @Convert(converter = BCryptoConverter::class)
    private var password: String,

    @NotNull
    @Column(length = 30, nullable = false)
    val name: String,

    @Column(columnDefinition = "boolean default false")
    @NotNull
    private var isVerified: Boolean = false,

    @Column
    private var tempToken: String? = null,

    @ManyToOne
    @JoinColumn(name = "group_id")
    val memberGroup: MemberGroup? = null,

    @ManyToMany(mappedBy = "members")
    val workspace: MutableList<Workspace> = mutableListOf(),

    @OneToMany(mappedBy = "owner", cascade = [CascadeType.ALL], orphanRemoval = true)
    val classfiy: MutableList<Classfiy> = mutableListOf(),

    @OneToMany(mappedBy = "ownerIndex")
    val tempFiles: MutableList<TempFile> = mutableListOf()

) : BaseCU(), UserDetails {

    fun generateTempToken(): String {
        tempToken = UUID.randomUUID().toString()
        return tempToken!!
    }

    fun verify() {
        isVerified = true
        tempToken = null
    }

    fun getTempToken(): String? = tempToken

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return listOf(SimpleGrantedAuthority("ROLE_MEMBER"))
    }

    override fun getUsername(): String = email

    override fun getPassword(): String = password

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true
}
