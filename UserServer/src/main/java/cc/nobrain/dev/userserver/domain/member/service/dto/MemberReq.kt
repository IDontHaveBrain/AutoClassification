package cc.nobrain.dev.userserver.domain.member.service.dto

import cc.nobrain.dev.userserver.common.validation.Name
import cc.nobrain.dev.userserver.common.validation.Password
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotNull

data class MemberReq(
        val register: Register
) {
    data class Register(
            @field:NotNull @field:Email var email: String,
            @field:NotNull @field:Password var password: String,
            @field:NotNull @field:Name var name: String
    )
}