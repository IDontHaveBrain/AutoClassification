package cc.nobrain.dev.userserver.scheduler

import cc.nobrain.dev.userserver.domain.base.entity.File
import cc.nobrain.dev.userserver.domain.base.entity.TempFile
import cc.nobrain.dev.userserver.domain.base.repository.FileRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class TempFileCleanupScheduler(
    private val fileRepository: FileRepository<TempFile>
) {

    @Scheduled(cron = "0 0/30 * * * ?")
    fun cleanUp() {
        val thirtyMinutesAgo = OffsetDateTime.now().minusMinutes(30)
        fileRepository.deleteByCreateDateTimeBefore(thirtyMinutesAgo)
    }
}