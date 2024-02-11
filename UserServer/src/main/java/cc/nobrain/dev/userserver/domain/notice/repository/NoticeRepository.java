package cc.nobrain.dev.userserver.domain.notice.repository;

import cc.nobrain.dev.userserver.domain.notice.entity.Notice;
import com.querydsl.core.types.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface NoticeRepository extends JpaRepository<Notice, Long>, QuerydslPredicateExecutor<Notice>, NoticeRepositoryCustom {
    Page<Notice> findAll(Predicate predicate, Pageable pageable);
}