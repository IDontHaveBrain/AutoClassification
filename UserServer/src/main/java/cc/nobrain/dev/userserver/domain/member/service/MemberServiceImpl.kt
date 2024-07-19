package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.base.service.EmailService
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import jakarta.servlet.http.HttpServletRequest
import org.modelmapper.ModelMapper
import org.springframework.cache.annotation.CacheEvict
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI


@Service
@Transactional(readOnly = true)
class MemberServiceImpl(
    private val memberRepository: MemberRepository,
    private val modelMapper: ModelMapper,
    private val emailService: EmailService,
) : MemberService {

    @Transactional
    override suspend fun register(req: MemberReq.Register, request: HttpServletRequest): MemberDto {
        if (duplicate(req.email)) {
            throw CustomException(ErrorInfo.DUPLICATE_EMAIL)
        }

        var newMember: Member = modelMapper.map(req, Member::class.java)
        newMember.generateTempToken();
        newMember = memberRepository.save(newMember)

        val url = UriComponentsBuilder.newInstance()
            .scheme(request.scheme)
            .host(request.serverName)
            .port(request.serverPort)
            .path("/api/member/verify")
            .queryParam("token", newMember.getTempToken())
            .build()
            .toString()

        var linkText = "회원가입 완료"
        var htmlMessage = "<p>회원가입을 완료하려면 아래 링크를 클릭하세요.</p><br/><a href=\"$url\">$linkText</a>"

        emailService.send(
            newMember.email,
            "회원가입 인증",
            htmlMessage
        )

        return modelMapper.map(newMember, MemberDto::class.java)
    }

    @Transactional
    override suspend fun verifyToken(token: String, request: HttpServletRequest): ResponseEntity<Void> {
        val member: Member = memberRepository.findByTempToken(token)
            .orElseThrow { CustomException(ErrorInfo.INVALID_DATA) }

        member.verify();
        memberRepository.save(member);

        val redirectUrl = UriComponentsBuilder.newInstance()
            .scheme(request.scheme)
            .host(request.serverName)
            .port(3000)
            .path("/sign-in")
            .build()
            .toString()

        return ResponseEntity.status(HttpStatus.SEE_OTHER)
            .location(URI.create(redirectUrl))
            .build<Void>()
    }

    override suspend fun duplicate(email: String): Boolean {
        return memberRepository.existsByEmail(email)
    }

    override suspend fun getMyInfo(): MemberDto {
        var member: Member? = MemberUtil.instance.getCurrentMemberDto()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        member = findMemberByEmail(member!!.username)

        return modelMapper.map(member, MemberDto::class.java)
    }

    override suspend fun findMemberById(id: Long): Member? {
        return memberRepository.findById(id).orElse(null)
    }

    override suspend fun findMemberByEmail(email: String): Member? {
        return memberRepository.findByEmail(email);
    }

    override suspend fun findMemberByEmails(emails: MutableList<String>): List<Member> {
        return memberRepository.findByEmailIn(emails);
    }

    override suspend fun search(email: String, pageable: Pageable): Page<MemberDto> {
        val members: Page<Member> = memberRepository.findByEmailLikeIgnoreCase("%$email%", pageable);
        return members.map { member -> modelMapper.map(member, MemberDto::class.java) };
    }
}