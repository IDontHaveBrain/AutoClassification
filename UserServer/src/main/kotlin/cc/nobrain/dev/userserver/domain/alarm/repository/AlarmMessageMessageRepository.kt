package cc.nobrain.dev.userserver.domain.alarm.repository

import cc.nobrain.dev.userserver.domain.alarm.entity.AlarmMessage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.querydsl.QuerydslPredicateExecutor

interface AlarmMessageMessageRepository : JpaRepository<AlarmMessage, Long>, JpaSpecificationExecutor<AlarmMessage> {

}