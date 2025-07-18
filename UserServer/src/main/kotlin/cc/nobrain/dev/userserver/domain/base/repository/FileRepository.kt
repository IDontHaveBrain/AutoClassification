package cc.nobrain.dev.userserver.domain.base.repository

import cc.nobrain.dev.userserver.domain.base.entity.File
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.time.OffsetDateTime

interface FileRepository<T : File> : JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
    fun deleteByCreateDateTimeBefore(dateTime: OffsetDateTime)
}