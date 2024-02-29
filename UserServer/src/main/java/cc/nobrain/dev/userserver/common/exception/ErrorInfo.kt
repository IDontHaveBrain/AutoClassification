package cc.nobrain.dev.userserver.common.exception;

import lombok.Getter;

@Getter
public enum ErrorInfo {

    LOGIN_USER_NOT_FOUND("U001", "Login User not found", 404);

    private final String code;
    private final String message;
    private final int status;

    ErrorInfo(String code, String message, int status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
