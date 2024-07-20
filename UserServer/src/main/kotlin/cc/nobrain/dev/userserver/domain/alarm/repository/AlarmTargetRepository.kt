package cc.nobrain.dev.userserver.domain.alarm.repository;

import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmTarget
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface AlarmTargetRepository<T: AlarmTarget> : JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
}