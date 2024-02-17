package cc.nobrain.dev.userserver.domain.sse.service.dto;

import cc.nobrain.dev.userserver.domain.sse.enums.SseEventType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@Builder
public class SseMessageDto {

    private String id;

    private SseEventType type;

    private Object message;

    public String toString() {
        ObjectMapper objectMapper = new ObjectMapper();
        String toStr;
        try {
            toStr = objectMapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return toStr;
    }
}
