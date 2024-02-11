package cc.nobrain.dev.userserver.domain.notice.entity;

import cc.nobrain.dev.userserver.domain.base.entity.BaseCU;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Notice extends BaseCU {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", length = 2000)
    private String content;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean sticky = false;

    @Max(5)
    @OneToMany(mappedBy = "ownerIndex", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<NoticeFile> attachments = new ArrayList<>();

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public void addFile(NoticeFile file) {
        if (Objects.isNull(attachments)) {
            attachments = new ArrayList<>();
        } else if (attachments.contains(file)) {
            return;
        }
        file.setRelation(this);
    }
}
