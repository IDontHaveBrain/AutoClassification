package cc.nobrain.dev.userserver.domain.notice.repository

import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import com.querydsl.core.types.OrderSpecifier
import com.querydsl.core.types.Predicate
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface NoticeRepositoryCustom {
    fun findAll(predicate: Predicate, vararg orders: OrderSpecifier<*>): List<Notice>

    fun findAll(predicate: Predicate, pageable: Pageable, vararg orders: OrderSpecifier<*>): Page<Notice>

    fun <T> findAll(predicate: Predicate, clazz: Class<T>, vararg orders: OrderSpecifier<*>): List<T>
}