package cc.nobrain.dev.userserver.domain.train.repository;

import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface ClassfiyRepository : JpaRepository<Classfiy, Long>, JpaSpecificationExecutor<Classfiy> {
}