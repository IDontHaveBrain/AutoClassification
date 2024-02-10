package cc.nobrain.dev.userserver.domain.base.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

@Builder
@Entity
@Getter
@DynamicUpdate
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
public abstract class File extends BaseCU {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String dtype;

    @Column(nullable = false)
    private String url;

    @NotNull
    @Column(nullable = false)
    private String fileName;

    @NotNull
    @Column(nullable = false)
    private Long size;

    @Column
    private String mimeType;

    @Column(nullable = false)
    private String path;

    public abstract <T> void setRelation(T ownerEntity);
}
