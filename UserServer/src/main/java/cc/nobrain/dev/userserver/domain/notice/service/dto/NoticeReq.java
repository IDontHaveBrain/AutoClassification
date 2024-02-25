package cc.nobrain.dev.userserver.domain.notice.service.dto;

import cc.nobrain.dev.userserver.domain.base.dto.FileDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class NoticeReq {

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Search {
        private String title;
        private String createMember;
    }

    @Getter
    public static class Create {
        private String title;
        private String content;
        private Boolean sticky;
        private List<FileDto> attachments;
    }
}
