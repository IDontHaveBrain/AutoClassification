package cc.nobrain.dev.userserver.domain.member.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberDto {
    private Long id;
    private String email;
//    private String password;
    private String name;
}
