package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.member.entity.Member_
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy
import cc.nobrain.dev.userserver.domain.train.entity.Classfiy_
import org.springframework.data.jpa.domain.Specification

object ClassfiySpecs {
    fun ownerId(ownerId: Long?): Specification<Classfiy> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(ownerId)) {
                return@Specification builder.conjunction()
            }
            builder.equal(root.get(Classfiy_.owner).get(Member_.id), ownerId)
        }
    }

    fun fetchFiles(): Specification<Classfiy> {
        return Specification { root, query, builder ->
            root.fetch(Classfiy_.testFiles)
            query?.distinct(true)
            builder.conjunction()
        }
    }
}