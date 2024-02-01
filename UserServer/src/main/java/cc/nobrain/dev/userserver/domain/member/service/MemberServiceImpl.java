package cc.nobrain.dev.userserver.domain.member.service;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository;
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
    public void register(MemberReq.Register req) {
        log.info("register: {}", req);

        Member newMember = modelMapper.map(req, Member.class);
        memberRepository.save(newMember);
    }

    @Override
    public Boolean duplicate(String email) {
        return memberRepository.existsByEmail(email);
    }
}
