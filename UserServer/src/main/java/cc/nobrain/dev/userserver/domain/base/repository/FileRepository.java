package cc.nobrain.dev.userserver.domain.base.repository;

import cc.nobrain.dev.userserver.domain.base.entity.File;
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface FileRepository<T extends File> extends JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
}
