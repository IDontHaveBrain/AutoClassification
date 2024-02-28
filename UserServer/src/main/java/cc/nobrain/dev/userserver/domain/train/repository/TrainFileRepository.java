package cc.nobrain.dev.userserver.domain.train.repository;

import cc.nobrain.dev.userserver.domain.base.repository.FileRepository;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile;

import java.util.List;

public interface TrainFileRepository extends FileRepository<TrainFile> {
    List<TrainFile> findByOwnerIndexId(Long ownerIndexId);
}