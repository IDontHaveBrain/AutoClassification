package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import org.springframework.data.domain.Pageable

interface NoticeService {
    fun searchNoticeList(search: NoticeReq.Search?, pageable: Pageable?): List<NoticeRes>

    fun createNotice(create: NoticeReq.Create?)
}