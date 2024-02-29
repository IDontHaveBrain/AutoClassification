package cc.nobrain.dev.userserver.domain.member.service;

import cc.nobrain.dev.userserver.common.exception.CustomException;
import cc.nobrain.dev.userserver.common.exception.ErrorInfo;
import cc.nobrain.dev.userserver.common.utils.MemberUtil;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    @CacheEvict(value = "member", key = "#req.email")
    public MemberDto register(MemberReq.Register req) {
        log.info("register: {}", req);

        Member newMember = modelMapper.map(req, Member.class);
        newMember = memberRepository.save(newMember);

        return modelMapper.map(newMember, MemberDto.class);
    }

    @Override
    public Boolean duplicate(String email) {
        return memberRepository.existsByEmail(email);
    }

    @Override
    public MemberDto getMyInfo() {
        Member member = MemberUtil.getCurrentMember().orElseThrow(() ->
                new CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND));
        member = findMemberByEmail(member.getEmail());
        return modelMapper.map(member, MemberDto.class);
    }

    public Member findMemberByEmail(String email) {
        return memberRepository.findByEmail(email);
    }
}
