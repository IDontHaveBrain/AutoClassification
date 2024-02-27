package cc.nobrain.dev.userserver.domain.base.repository;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface FileRepository<T extends File> extends JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
}
