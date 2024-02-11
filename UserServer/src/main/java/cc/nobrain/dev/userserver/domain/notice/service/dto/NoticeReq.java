package cc.nobrain.dev.userserver.domain.notice.service.dto;

import cc.nobrain.dev.userserver.domain.base.dto.FileDto;
import lombok.Getter;

import java.util.List;

public class NoticeReq {

    @Getter
    public static class Search {
        private String title;
        private String content;
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
