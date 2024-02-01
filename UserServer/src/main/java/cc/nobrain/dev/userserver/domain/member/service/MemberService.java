package cc.nobrain.dev.userserver.domain.member.service;

import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq;

public interface MemberService {
    void register(MemberReq.Register req);

    Boolean duplicate(String email);
}
