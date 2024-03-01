package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import lombok.extern.slf4j.Slf4j
import org.modelmapper.ModelMapper
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


@Service
@Transactional(readOnly = true)
class MemberServiceImpl(
    private val memberRepository: MemberRepository,
    private val modelMapper: ModelMapper
) : MemberService {

    @Transactional
    @CacheEvict(value = ["member"], key = "#req.email")
    override fun register(req: MemberReq.Register): MemberDto {
        var newMember: Member = modelMapper.map(req, Member::class.java)
        newMember = memberRepository.save(newMember)

        return modelMapper.map(newMember, MemberDto::class.java)
    }

    override fun duplicate(email: String): Boolean {
        return memberRepository.existsByEmail(email)
    }

    override fun getMyInfo(): MemberDto {
        var member: Member? = MemberUtil.getCurrentMember()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        member = findMemberByEmail(member!!.username)

        return modelMapper.map(member, MemberDto::class.java)
    }

    override fun findMemberByEmail(email: String): Member? {
        return memberRepository.findByEmail(email);
    }
}