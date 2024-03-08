package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import org.springframework.data.domain.Pageable

interface NoticeService {
    suspend fun searchNoticeList(search: NoticeReq.Search?, pageable: Pageable): List<NoticeRes>

    suspend fun createNotice(create: NoticeReq.Create?)

    suspend fun updateNotice(id: Long, update: NoticeReq.Create)

    suspend fun deleteNotice(id: Long)
}