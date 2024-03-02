package cc.nobrain.dev.userserver.domain.train.repository

import cc.nobrain.dev.userserver.domain.base.repository.FileRepository
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile

interface TrainFileRepository : FileRepository<TrainFile> {
    fun findByOwnerIndexId(ownerIndexId: Long): List<TrainFile>
}