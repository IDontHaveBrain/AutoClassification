package cc.nobrain.dev.userserver.domain.notice.repository;

import cc.nobrain.dev.userserver.domain.notice.entity.Notice;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NoticeRepositoryCustom {
    List<Notice> findAll(Predicate predicate, OrderSpecifier<?>... orders);

    Page<Notice> findAll(Predicate predicate, Pageable pageable, OrderSpecifier<?>... orders);

    <T> List<T> findAll(Predicate predicate, Class<T> clazz, OrderSpecifier<?>... orders);
}
