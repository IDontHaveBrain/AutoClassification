package cc.nobrain.dev.userserver.domain.alarm.repository;

import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmRead
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface AlarmReadRepository : JpaRepository<AlarmRead, Long>, JpaSpecificationExecutor<AlarmRead> {
}