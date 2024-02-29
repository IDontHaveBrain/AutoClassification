package cc.nobrain.dev.userserver.domain.base.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import lombok.AccessLevel
import lombok.NoArgsConstructor
import org.hibernate.annotations.DiscriminatorOptions
import org.hibernate.annotations.DynamicUpdate

@Entity
@DynamicUpdate
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(discriminatorType = DiscriminatorType.STRING)
@DiscriminatorOptions(force = true)
abstract class File : BaseCU() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(insertable = false, updatable = false)
    var dtype: String? = null

    @Column(nullable = false)
    var url: String? = null

    @NotNull
    @Column(nullable = false)
    var fileName: String? = null

    @Column(nullable = false)
    var originalFileName: String? = null

    @Column(nullable = false)
    var fileExtension: String? = null

    @NotNull
    @Column(nullable = false)
    var size: Long? = null

    @Column
    var contentType: String? = null

    @Column(nullable = false)
    var path: String? = null

    abstract fun <T> setRelation(ownerEntity: T)
}