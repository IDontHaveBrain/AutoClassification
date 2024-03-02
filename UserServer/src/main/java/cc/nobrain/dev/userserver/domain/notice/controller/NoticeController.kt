package cc.nobrain.dev.userserver.domain.notice.controller

import cc.nobrain.dev.userserver.domain.notice.service.NoticeService
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notice")
class NoticeController(val noticeService: NoticeService) {

    @GetMapping
    fun searchNoticeList(search: NoticeReq.Search, pageable: Pageable?): List<NoticeRes> {
        return noticeService.searchNoticeList(search, pageable)
    }


    @PostMapping
    fun createNotice(create: NoticeReq.Create): ResponseEntity<Unit> {
        noticeService.createNotice(create)
        return ResponseEntity.ok().build()
    }
}