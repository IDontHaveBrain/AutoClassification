package cc.nobrain.dev.userserver.common.security

import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.oauth2.jwt.Jwt

class CustomJwtAuthenticationConverter(
        private val customUserDetailService: CustomUserDetailService
) : Converter<Jwt, AbstractAuthenticationToken> {

    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        val username = jwt.getClaimAsString("sub")
        val member = customUserDetailService.loadUserByUsername(username)
                ?: throw UsernameNotFoundException("User not found")

        return UsernamePasswordAuthenticationToken(member, jwt, member.authorities)
    }
}