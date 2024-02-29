package cc.nobrain.dev.userserver.common.security

import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.web.authentication.AuthenticationConverter
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap

class PasswordConverter : AuthenticationConverter {
    override fun convert(request: HttpServletRequest): Authentication? {
        val parameterMap = request.parameterMap
        val parameters: MultiValueMap<String, String> = LinkedMultiValueMap()
        for ((key, value) in parameterMap) {
            if (!value.isNullOrEmpty()) {
                parameters.add(key, value[0])
            }
        }

        val grantType = parameters.getFirst("grant_type")
        if (AuthorizationGrantType.PASSWORD.value != grantType) {
            return null
        }

        val username = parameters.getFirst("username")
        val password = parameters.getFirst("password")
        if (username == null || password == null) {
            throw OAuth2AuthenticationException("invalid")
        }

        val additionalParameters = HashMap<String, Any>()
        parameters.forEach { (key, value) ->
            if (key != "grant_type" && key != "refresh_token") {
                additionalParameters[key] = if (value.size == 1) value[0] else value.toTypedArray()
            }
        }

        val clientPrincipal = SecurityContextHolder.getContext().authentication

        return PasswordToken(clientPrincipal, additionalParameters)
    }
}