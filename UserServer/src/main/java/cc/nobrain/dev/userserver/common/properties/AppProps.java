package cc.nobrain.dev.userserver.common.properties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@ConfigurationProperties(prefix = "app.storage")
@RequiredArgsConstructor
public class AppProps {
    private final String path;
    private final String resourcePath;
    private final Long maxFileSize;
}
