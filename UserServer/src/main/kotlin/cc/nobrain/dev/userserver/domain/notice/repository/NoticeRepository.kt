package cc.nobrain.dev.userserver.domain.notice.repository

import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.querydsl.QuerydslPredicateExecutor

interface NoticeRepository : JpaRepository<Notice, Long>, JpaSpecificationExecutor<Notice>, QuerydslPredicateExecutor<Notice>, NoticeRepositoryCustom