package cc.nobrain.dev.userserver.member;

import cc.nobrain.dev.userserver.domain.member.service.MemberService;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@SpringBootTest
public class GenTestMember {

    @Autowired
    private MemberService memberService;

//    @Test
//    @Transactional
//    @Rollback(false)
//    public void testAccount() {
//        log.info("testAccount");
//
//        MemberReq.Register req = new MemberReq.Register("test@test.com", "123123!", "test");
//
//        memberService.register(req);
//
//    }

}
