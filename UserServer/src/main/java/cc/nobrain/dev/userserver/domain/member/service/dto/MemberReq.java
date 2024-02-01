package cc.nobrain.dev.userserver.domain.member.service.dto;

import cc.nobrain.dev.userserver.common.validation.Name;
import cc.nobrain.dev.userserver.common.validation.Password;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class MemberReq {

    @Getter
    @AllArgsConstructor
    public static class Register {
        @NotNull
        @Email
        private String email;

        @NotNull
        @Password
        private String password;

        @NotNull
        @Name
        private String name;
    }
}
