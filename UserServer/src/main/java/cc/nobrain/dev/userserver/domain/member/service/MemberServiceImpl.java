package cc.nobrain.dev.userserver.domain.member.service;

import cc.nobrain.dev.userserver.common.utils.GlobalUtil;
import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
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
        Member member = GlobalUtil.getCurrentMember();
        return modelMapper.map(member, MemberDto.class);
    }
}
