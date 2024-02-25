package cc.nobrain.dev.userserver.domain.notice.controller;

import cc.nobrain.dev.userserver.domain.notice.service.NoticeService;
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq;
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice")
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public List<NoticeRes> searchNoticeList(NoticeReq.Search search, Pageable pageable) {
        return noticeService.searchNoticeList(search, pageable);
    }

    @PostMapping
    public ResponseEntity createNotice(NoticeReq.Create create) {
        noticeService.createNotice(create);
        return ResponseEntity.ok().build();
    }

}
