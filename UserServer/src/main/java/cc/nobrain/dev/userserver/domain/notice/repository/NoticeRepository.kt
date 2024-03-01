package cc.nobrain.dev.userserver.domain.notice.repository

import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface NoticeRepository : JpaRepository<Notice, Long>, JpaSpecificationExecutor<Notice>