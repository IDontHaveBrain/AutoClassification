package cc.nobrain.dev.userserver.domain.notice.service.dto;

import cc.nobrain.dev.userserver.domain.base.dto.FileDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class NoticeRes extends NoticeDto {
    private List<FileDto> attachments;
}
