package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.CoroutineUtil
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeSpecs
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import kotlinx.coroutines.withContext
import org.modelmapper.ModelMapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class NoticeServiceImpl(
    private val noticeRepository: NoticeRepository,
    private val modelMapper: ModelMapper
) : NoticeService {

    override suspend fun searchNoticeList(search: NoticeReq.Search?, pageable: Pageable): Page<NoticeRes> {
        val spec = Specification.where(NoticeSpecs.titleLike(search?.title))
            .and(NoticeSpecs.createMemberLike(search?.createMember))

        val rst: Page<Notice> = noticeRepository.findAll(spec, pageable)
        return if (rst.content.isEmpty()) {
            Page.empty(pageable)
        } else {
            rst.map { notice -> modelMapper.map(notice, NoticeRes::class.java) ?: NoticeRes() }
        }
    }

    @Transactional
    override suspend fun createNotice(create: NoticeReq.Create?) {
        withContext(CoroutineUtil.securedIO) {
            if (create == null) throw CustomException(ErrorInfo.INVALID_DATA);
            val notice = modelMapper.map(create, Notice::class.java);
            noticeRepository.save(notice);
        }
    }

    @Transactional
    override suspend fun updateNotice(id: Long, update: NoticeReq.Create) {
        val notice = noticeRepository.findById(id).orElseThrow { CustomException(ErrorInfo.INVALID_DATA) }
        modelMapper.map(update, notice)
        noticeRepository.save(notice)
    }

    @Transactional
    override suspend fun deleteNotice(id: Long) = withContext(CoroutineUtil.securedIO) {
        noticeRepository.deleteById(id)
    }
}
