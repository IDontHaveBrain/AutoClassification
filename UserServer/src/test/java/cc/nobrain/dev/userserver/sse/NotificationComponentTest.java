package cc.nobrain.dev.userserver.sse;

import cc.nobrain.dev.userserver.common.component.NotificationComponent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@Slf4j
@SpringBootTest
public class NotificationComponentTest {

    private NotificationComponent notificationComponent;

    @BeforeEach
    void setUp() {
        // Arrange
        notificationComponent = new NotificationComponent();
    }

    @Test
    void addSubscriber() {
        // Act
        notificationComponent.addSubscriber(1L);

        // Assert: Check if the user was added to the lastResponse and processors map
        assertTrue(notificationComponent.lastResponse.containsKey(1L));
        assertTrue(notificationComponent.processors.containsKey(1L));
    }

    @Test
    void updateLastResponse() {
        // Arrange
        Instant now = Instant.now();

        // Act
        notificationComponent.updateLastResponse(1L, now);

        // Assert: Check if the last response time was updated correctly
        assertEquals(now, notificationComponent.lastResponse.get(1L));
    }

    @Test
    void removeSubscriber() {
        // Arrange
        notificationComponent.addSubscriber(1L);

        // Act
        notificationComponent.removeSubscriber(1L);

        // Assert: Check if the user was removed from the lastResponse and processors map
        assertFalse(notificationComponent.lastResponse.containsKey(1L));
        assertFalse(notificationComponent.processors.containsKey(1L));
    }

    @Test
    void subscribe() {
        // Act
        var flux = notificationComponent.subscribe(1L);

        // Assert: Check if the user was added and valid flux was returned
        assertTrue(notificationComponent.lastResponse.containsKey(1L));
        assertTrue(notificationComponent.processors.containsKey(1L));
        assertNotNull(flux);
    }

    @Test
    void removeInactiveUsers() throws InterruptedException {
        // Arrange
        notificationComponent.addSubscriber(1L);

        // Act: Update the last response time to be more than 30 seconds ago
        notificationComponent.updateLastResponse(1L, Instant.now().minusSeconds(40));

        // wait for some time to ensure that user is considered inactive.
        Executors.newSingleThreadScheduledExecutor().schedule(() -> {
                    notificationComponent.removeInactiveUsers();
                },
                2, // here, I changed it to 2 seconds
                TimeUnit.SECONDS
        );

        // Sleep the test for a short time to ensure the scheduled executor has run
        Thread.sleep(11000);

        // Assert: Check if the user was removed from the lastResponse and processors map
        assertFalse(notificationComponent.lastResponse.containsKey(1L));
        assertFalse(notificationComponent.processors.containsKey(1L));
    }
}
