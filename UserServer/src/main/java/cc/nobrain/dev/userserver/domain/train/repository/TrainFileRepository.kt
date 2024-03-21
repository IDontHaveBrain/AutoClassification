package cc.nobrain.dev.userserver.domain.train.repository

import cc.nobrain.dev.userserver.domain.base.repository.FileRepository
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile

interface TrainFileRepository : FileRepository<TrainFile> {
    fun findByOwnerIndex_Id(ownerIndexId: Long): List<TrainFile>

    fun findByOwnerIndex_IdIn(ids: MutableCollection<Long>): List<TrainFile>
}