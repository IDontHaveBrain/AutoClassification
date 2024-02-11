package cc.nobrain.dev.userserver.domain.notice.service;

import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq;
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NoticeService {
    List<NoticeRes> searchNoticeList(NoticeReq.Search search, Pageable pageable);
}
