package cc.nobrain.dev.userserver.domain.member.service.dto

data class MemberDto (
    var id: Long? = null,
    var email: String? = null,
//    var password: String? = null,
    var name: String? = null
)