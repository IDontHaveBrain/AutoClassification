package cc.nobrain.dev.userserver.domain.notice.repository

import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.entity.QNotice
import com.querydsl.core.types.OrderSpecifier
import com.querydsl.core.types.Predicate
import com.querydsl.core.types.Projections
import com.querydsl.jpa.impl.JPAQueryFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.support.PageableExecutionUtils

class NoticeRepositoryImpl(private val factory: JPAQueryFactory): NoticeRepositoryCustom {

    override fun findAll(predicate: Predicate, vararg orders: OrderSpecifier<*>): List<Notice> =
        factory.selectFrom(QNotice.notice)
            .where(predicate)
            .orderBy(*orders)
            .fetch()

    override fun findAll(predicate: Predicate, pageable: Pageable, vararg orders: OrderSpecifier<*>): Page<Notice> {
        val query = factory.selectFrom(QNotice.notice)
            .where(predicate)
            .orderBy(*orders)
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetch()

        val total: () -> Long = {
            factory
                .selectFrom(QNotice.notice)
                .where(predicate)
                .fetchCount()
        }

        return PageableExecutionUtils.getPage(query, pageable, total)
    }

    override fun <T> findAll(predicate: Predicate, clazz: Class<T>, vararg orders: OrderSpecifier<*>): List<T> =
        factory.select(Projections.constructor(clazz))
            .from(QNotice.notice)
            .where(predicate)
            .orderBy(*orders)
            .fetch()
}