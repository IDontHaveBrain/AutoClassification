package cc.nobrain.dev.userserver.domain.notice.repository

import cc.nobrain.dev.userserver.common.utils.CommonUtil
import cc.nobrain.dev.userserver.domain.notice.entity.QNotice
import com.querydsl.core.types.OrderSpecifier
import com.querydsl.core.types.dsl.BooleanExpression

object NoticeDslHelper {

    @JvmStatic
    fun titleLike(title: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(title)) {
            return null
        }
        return QNotice.notice.title.containsIgnoreCase(title)
    }

    @JvmStatic
    fun contentLike(content: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(content)) {
            return null
        }
        return QNotice.notice.content.containsIgnoreCase(content)
    }

    @JvmStatic
    fun createMemberLike(createMember: String?): BooleanExpression? {
        if (CommonUtil.isEmpty(createMember)) {
            return null
        }
        return QNotice.notice.createMember.containsIgnoreCase(createMember)
    }

    @JvmStatic
    fun isSticky(sticky: Boolean?): BooleanExpression? {
        if (sticky == null) {
            return null
        }
        return QNotice.notice.sticky.eq(sticky)
    }

    fun orderByUpdateTime(): OrderSpecifier<*> {
        return QNotice.notice.updateDateTime.desc()
    }
}