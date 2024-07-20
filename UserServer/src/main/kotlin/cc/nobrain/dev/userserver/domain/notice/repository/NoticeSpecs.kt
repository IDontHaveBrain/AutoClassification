package cc.nobrain.dev.userserver.domain.notice.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.entity.Notice_
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification

object NoticeSpecs {

    fun titleLike(title: String?): Specification<Notice> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(title)) {
                null
            } else {
                builder.like(builder.lower(root.get(Notice_.title)), "%${title?.lowercase()}%")
            }
        }
    }

    fun contentLike(content: String?): Specification<Notice> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(content)) {
                null
            } else {
                builder.like(builder.lower(root.get(Notice_.content)), "%${content?.lowercase()}%")
            }
        }
    }

    fun createMemberLike(createMember: String?): Specification<Notice> {
        return Specification { root, query, builder ->
            if (CommonUtil.isEmpty(createMember)) {
                null
            } else {
                builder.like(builder.lower(root.get(Notice_.createMember)), "%${createMember?.lowercase()}%")
            }
        }
    }

    fun isSticky(sticky: Boolean?): Specification<Notice> {
        return Specification { root, query, builder ->
            if (sticky == null) {
                null
            } else {
                builder.equal(root.get(Notice_.sticky), sticky)
            }
        }
    }

    fun orderByUpdateTime(): Sort {
        return Sort.by(Sort.Direction.DESC, Notice_.updateDateTime.name)
    }
}