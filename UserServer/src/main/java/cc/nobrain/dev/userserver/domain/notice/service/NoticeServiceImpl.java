package cc.nobrain.dev.userserver.domain.notice.service;

import cc.nobrain.dev.userserver.domain.notice.entity.Notice;
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeDslHelper;
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository;
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq;
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;

import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<NoticeRes> searchNoticeList(NoticeReq.Search search, Pageable pageable) {
        BooleanBuilder where = new BooleanBuilder();
        where.and(NoticeDslHelper.titleLike(search.getTitle()))
                .and(NoticeDslHelper.contentLike(search.getContent()))
                .and(NoticeDslHelper.createMemberLike(search.getCreateMember()));

        List<Notice> rst = noticeRepository.findAll(where, NoticeDslHelper.orderByUpdateTime());

        return rst.stream()
                .map(notice -> modelMapper.map(notice, NoticeRes.class))
                .toList();
    }
}
