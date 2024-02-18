package cc.nobrain.dev.userserver.domain.alarm.repository;

import cc.nobrain.dev.userserver.domain.alarm.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface AlarmRepository extends JpaRepository<Alarm, Long>, JpaSpecificationExecutor, QuerydslPredicateExecutor<Alarm>, AlarmRepositoryCustom {

}
