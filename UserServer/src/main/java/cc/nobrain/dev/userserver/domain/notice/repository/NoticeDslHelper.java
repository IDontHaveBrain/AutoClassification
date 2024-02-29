package cc.nobrain.dev.userserver.domain.notice.repository;

import cc.nobrain.dev.userserver.common.utils.CommonUtil;
import cc.nobrain.dev.userserver.domain.notice.entity.QNotice;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;

public class NoticeDslHelper {

    public static BooleanExpression titleLike(String title) {
        if (CommonUtil.isEmpty(title)) {
            return null;
        }
        return QNotice.notice.title.containsIgnoreCase(title);
    }

    public static BooleanExpression contentLike(String content) {
        if (CommonUtil.isEmpty(content)) {
            return null;
        }
        return QNotice.notice.content.containsIgnoreCase(content);
    }

    public static BooleanExpression createMemberLike(String createMember) {
        if (CommonUtil.isEmpty(createMember)) {
            return null;
        }
        return QNotice.notice.createMember.containsIgnoreCase(createMember);
    }

    public static BooleanExpression isSticky(Boolean sticky) {
        if (sticky == null) {
            return null;
        }
        return QNotice.notice.sticky.eq(sticky);
    }

    public static OrderSpecifier orderByUpdateTime() {
        return QNotice.notice.updateDateTime.desc();
    }
}
