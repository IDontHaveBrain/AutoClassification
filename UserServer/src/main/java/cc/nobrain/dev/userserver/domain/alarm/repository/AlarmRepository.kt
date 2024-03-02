package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.querydsl.QuerydslPredicateExecutor

interface AlarmRepository : JpaRepository<Alarm, Long>, JpaSpecificationExecutor<Alarm>, QuerydslPredicateExecutor<Alarm>, AlarmRepositoryCustom