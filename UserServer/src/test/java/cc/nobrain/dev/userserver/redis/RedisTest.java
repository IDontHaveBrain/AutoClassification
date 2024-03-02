/*
package cc.nobrain.dev.userserver.redis;

import cc.nobrain.dev.userserver.common.component.ReactiveRedisHelper;
import cc.nobrain.dev.userserver.common.component.RedisHelper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@Slf4j
@SpringBootTest
public class RedisTest {

    @Autowired
    private RedisHelper redisHelper;

    @Autowired
    private ReactiveRedisHelper reactiveRedisHelper;

    @Test
    @Order(1)
    public void test() {
        log.info("Redis Test Start");

        redisHelper.put("test", "test", 120L);
        String test = redisHelper.getString("test");
        System.out.println(test);
        log.info("test : {}", test);

        String test2 = redisHelper.get("test", String.class);
        log.info("test2 : {}", test2);

        log.info("Redis Test End");
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestDto {
        private String name;
        private Long age;
    }

    @Test
    @Order(2)
    public void test2() {

        log.info("Redis Test Start");

        TestDto testDto = new TestDto();
        testDto.setAge(10L);
        testDto.setName("test");

        redisHelper.put("testDto", testDto, 120L);
        TestDto test = redisHelper.get("testDto", TestDto.class);
        System.out.println(test);
        log.info("test : {}", test);

        log.info("Redis Test End");
    }

    @Test
    @Order(3)
    public void reactiveTest() {
        log.info("Reactive Redis Test Start");

        reactiveRedisHelper.put("test", "test", 120L).subscribe(
                result1 -> {
                    reactiveRedisHelper.getString("test").subscribe(
                            result2 -> {
                                System.out.println(result2);
                                log.info("test: {}", result2);
                                log.info("Reactive Redis Test End");
                            },
                            error -> log.error("Error in reactiveRedisHelper.get()", error)
                    );
                },
                error -> log.error("Error in reactiveRedisHelper.put()", error)
        );

        TestDto testDto = new TestDto("test", 20L);
        Boolean putRst = reactiveRedisHelper.put("testDto", testDto, 120L).block();
        log.info("putRst : {}", putRst);

        TestDto rstDto = reactiveRedisHelper.get("testDto", TestDto.class).block();
        log.info("rstDto : {}", rstDto);

        log.info("Reactive Redis Test End");
    }
}
*/
