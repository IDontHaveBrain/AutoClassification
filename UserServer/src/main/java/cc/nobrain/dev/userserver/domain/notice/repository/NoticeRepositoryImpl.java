package cc.nobrain.dev.userserver.domain.notice.repository;

import cc.nobrain.dev.userserver.domain.notice.entity.Notice;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;
import java.util.function.LongSupplier;

import static cc.nobrain.dev.userserver.domain.notice.entity.QNotice.notice;

@RequiredArgsConstructor
public class NoticeRepositoryImpl implements NoticeRepositoryCustom {

    private final JPAQueryFactory factory;

    @Override
    public List<Notice> findAll(Predicate predicate, OrderSpecifier<?>... orders) {
        return factory.selectFrom(notice)
                .where(predicate)
                .orderBy(orders)
                .fetch();
    }

    @Override
    public Page<Notice> findAll(Predicate predicate, Pageable pageable, OrderSpecifier<?>... orders) {
        List query = factory.selectFrom(notice)
                .where(predicate)
                .orderBy(orders)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        LongSupplier total = () -> factory
                .selectFrom(notice)
                .where(predicate)
                .fetchCount();

        return PageableExecutionUtils.getPage(query, pageable, total);
    }

    @Override
    public <T> List<T> findAll(Predicate predicate, Class<T> clazz, OrderSpecifier<?>... orders) {
        return factory.select(Projections.constructor(clazz))
                .from(notice)
                .where(predicate)
                .orderBy(orders)
                .fetch();
    }
}
