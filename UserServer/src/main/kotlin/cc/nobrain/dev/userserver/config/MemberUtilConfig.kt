package cc.nobrain.dev.userserver.config

import cc.nobrain.dev.userserver.common.utils.MemberUtil
import jakarta.annotation.PostConstruct
import org.springframework.context.annotation.Configuration

@Configuration
class MemberUtilConfig(private val memberUtil: MemberUtil) {

    @PostConstruct
    fun init() {
        MemberUtil.initialize(memberUtil)
    }
}
