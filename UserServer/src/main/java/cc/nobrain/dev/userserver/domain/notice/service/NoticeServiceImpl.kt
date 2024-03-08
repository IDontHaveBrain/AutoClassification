package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeDslHelper
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import com.querydsl.core.BooleanBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.modelmapper.ModelMapper
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class NoticeServiceImpl(
    private val noticeRepository: NoticeRepository,
    private val modelMapper: ModelMapper
) : NoticeService {

    override suspend fun searchNoticeList(search: NoticeReq.Search?, pageable: Pageable): List<NoticeRes> {
        val where = BooleanBuilder()
        where.and(NoticeDslHelper.titleLike(search?.title))
            .and(NoticeDslHelper.createMemberLike(search?.createMember))

        val rst = noticeRepository.findAll(where, pageable);

        return rst?.map { notice -> modelMapper.map(notice, NoticeRes::class.java) }?.toList() ?: emptyList()
    }

    @Transactional
    override suspend fun createNotice(create: NoticeReq.Create?) {
        if (create == null) throw CustomException(ErrorInfo.INVALID_DATA);
        val notice = modelMapper.map(create, Notice::class.java);
        noticeRepository.save(notice);
    }

    @Transactional
    override suspend fun updateNotice(id: Long, update: NoticeReq.Create) {
        if (update == null) throw CustomException(ErrorInfo.INVALID_DATA)
        val notice = noticeRepository.findById(id).orElseThrow { CustomException(ErrorInfo.INVALID_DATA) }
        modelMapper.map(update, notice)

        noticeRepository.save(notice)
    }

    @Transactional
    override suspend fun deleteNotice(id: Long) {
        noticeRepository.deleteById(id)
    }
}