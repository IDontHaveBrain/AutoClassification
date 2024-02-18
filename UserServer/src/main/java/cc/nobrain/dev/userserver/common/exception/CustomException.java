package cc.nobrain.dev.userserver.common.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {
    private final String code;
    private final int status;

    public CustomException(String message, String code, int status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public CustomException(String message) {
        super(message);
        this.code = "X000";
        this.status = 500;
    }

    public CustomException(ErrorInfo errorInfo) {
        super(errorInfo.getMessage());
        this.code = errorInfo.getCode();
        this.status = errorInfo.getStatus();
    }
}
