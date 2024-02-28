package cc.nobrain.dev.userserver.domain.base.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.DiscriminatorOptions;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Getter
@DynamicUpdate
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(discriminatorType = DiscriminatorType.STRING)
@DiscriminatorOptions(force=true)
public abstract class File extends BaseCU {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(insertable = false, updatable = false)
    private String dtype;

    @Column(nullable = false)
    private String url;

    @NotNull
    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String fileExtension;

    @NotNull
    @Column(nullable = false)
    private Long size;

    @Column
    private String contentType;

    @Column(nullable = false)
    private String path;

    public abstract <T> void setRelation(T ownerEntity);
}
