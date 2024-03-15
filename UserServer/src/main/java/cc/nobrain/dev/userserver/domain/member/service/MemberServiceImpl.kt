package cc.nobrain.dev.userserver.domain.member.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq
import org.modelmapper.ModelMapper
import org.springframework.cache.annotation.CacheEvict
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


@Service
@Transactional(readOnly = true)
class MemberServiceImpl(
    private val memberRepository: MemberRepository,
    private val modelMapper: ModelMapper
) : MemberService {

    @Transactional
    override suspend fun register(req: MemberReq.Register): MemberDto {
        if (duplicate(req.email)) {
            throw CustomException(ErrorInfo.DUPLICATE_EMAIL)
        }

        var newMember: Member = modelMapper.map(req, Member::class.java)
        newMember = memberRepository.save(newMember)

        return modelMapper.map(newMember, MemberDto::class.java)
    }

    override suspend fun duplicate(email: String): Boolean {
        return memberRepository.existsByEmail(email)
    }

    override suspend fun getMyInfo(): MemberDto {
        var member: Member? = MemberUtil.getCurrentMemberDto()
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