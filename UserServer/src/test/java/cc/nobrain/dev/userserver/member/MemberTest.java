/*
package cc.nobrain.dev.userserver.member;

import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository;
import cc.nobrain.dev.userserver.domain.member.service.MemberService;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberDto;
import cc.nobrain.dev.userserver.domain.member.service.dto.MemberReq;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
public class MemberTest {

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberRepository memberRepository;

    public static final String TEST_EMAIL = "nj.jo@test.com";
    public static final String TEST_PASSWORD = "!Aa123123";
    public static final String TEST_NAME = "nj.jo";

    @AfterEach
    @Transactional
    public void afterAll() {
        System.out.println("afterAll");
        System.out.println(memberRepository.deleteByEmail(TEST_EMAIL));
    }

    @Test
    @Order(1)
    @Transactional
    void register() {
        MemberReq.Register req = new MemberReq.Register(TEST_EMAIL, TEST_PASSWORD, TEST_NAME);
        MemberDto newMember = memberService.register(req);

        System.out.println(newMember);

        Assertions.assertEquals(newMember.getEmail(), TEST_EMAIL);
    }


    @Test
    @Order(2)
    void duplicate() {
        String email = "test@test.com";
        Assertions.assertEquals(memberService.duplicate(email), true);
    }


}
*/
