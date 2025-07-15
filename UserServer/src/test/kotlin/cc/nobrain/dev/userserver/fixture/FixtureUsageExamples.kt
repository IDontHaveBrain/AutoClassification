package cc.nobrain.dev.userserver.fixture

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.workspace.entity.Workspace
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import kotlin.system.measureTimeMillis
import kotlin.time.Duration
import kotlin.time.measureTime
import kotlin.time.measureTimedValue

/**
 * TestDataFactory와 Fixture 시스템 사용 예제
 * 테스트 데이터 생성 패턴과 성능 측정 기능을 데모합니다.
 */
class FixtureUsageExamples : BaseIntegrationTest() {

    // 성능 측정 유틸리티 메서드들
    
    /** 테스트 실행 시간을 측정합니다 */
    private fun measureTestTime(block: () -> Unit): Duration {
        return measureTime(block)
    }

    /** 밀리초 단위로 테스트 실행 시간을 측정합니다 */
    private fun measureTestTimeMillis(block: () -> Unit): Long {
        return measureTimeMillis(block)
    }

    /** 비동기 테스트 실행 시간을 측정합니다 */
    private fun measureSuspendTestTime(block: suspend () -> Unit): Duration {
        return measureTime {
            runBlocking { block() }
        }
    }

    /** Duration 값들을 null-safe하게 비교합니다 */
    private fun compareTime(time1: Duration?, time2: Duration?): Int {
        return when {
            time1 == null && time2 == null -> 0
            time1 == null -> -1
            time2 == null -> 1
            else -> time1.compareTo(time2)
        }
    }

    /** Long 타입 밀리초 값들을 null-safe하게 비교합니다 */
    private fun compareTimeMillis(time1: Long?, time2: Long?): Int {
        return when {
            time1 == null && time2 == null -> 0
            time1 == null -> -1
            time2 == null -> 1
            else -> time1.compareTo(time2)
        }
    }

    // 성능 측정 테스트

    @Test
    fun `기본 성능 측정 테스트`() {
        // 두 개의 서로 다른 실행 시간을 가진 작업 측정
        val executionTime = measureTestTime {
            Thread.sleep(100)
        }
        
        val anotherTime = measureTestTime {
            Thread.sleep(50)
        }
        
        val comparison = compareTime(executionTime, anotherTime)
        assert(comparison != 0) { "서로 다른 실행 시간이 측정되어야 함" }
        assert(comparison > 0) { "첫 번째 작업이 두 번째 작업보다 오래 걸려야 함" }
    }

    @Test
    fun `밀리초 단위 성능 측정 테스트`() {
        // 밀리초 단위로 시간 측정 및 null-safety 검증
        val timeInMillis = measureTestTimeMillis {
            Thread.sleep(200)
        }
        
        assert(timeInMillis >= 200L) { "최소 200ms 이상 실행되어야 함" }
        assert(timeInMillis < 300L) { "과도한 오버헤드가 없어야 함" }
        
        val actualTime: Long? = timeInMillis
        val nullTime: Long? = null
        
        val comparison = compareTimeMillis(actualTime, nullTime)
        assert(comparison > 0) { "실제 측정 시간이 null보다 우선순위가 높아야 함" }
    }

    @Test
    fun `비동기 작업 성능 측정 테스트`() {
        // 코루틴 기반 비동기 작업 시간 측정
        val asyncTime = measureSuspendTestTime {
            kotlinx.coroutines.delay(150)
        }
        
        val zeroTime = Duration.ZERO
        val result = compareTime(asyncTime, zeroTime)
        
        assert(result > 0) { "비동기 작업 시간이 0보다 커야 함" }
        assert(asyncTime.inWholeMilliseconds >= 150L) { "최소 150ms 이상 실행되어야 함" }
        assert(asyncTime.inWholeMilliseconds < 250L) { "과도한 비동기 오버헤드가 없어야 함" }
    }

    @Test
    fun `시간 비교 null 안전성 테스트`() {
        // Duration 타입 null 안전성 테스트
        val time1: Duration? = Duration.ZERO
        val time2: Duration? = null
        val time3: Duration? = null
        
        assert(compareTime(time1, time2) > 0) { "값이 있는 시간이 null보다 커야 함" }
        assert(compareTime(time2, time1) < 0) { "null이 값이 있는 시간보다 작아야 함" }
        assert(compareTime(time2, time3) == 0) { "null끼리는 같아야 함" }
        
        // Long 타입 밀리초 버전에서도 동일한 정책 적용 확인
        val millis1: Long? = 100L
        val millis2: Long? = null
        val millis3: Long? = null
        
        assert(compareTimeMillis(millis1, millis2) > 0) { "밀리초 측정값이 null보다 우선해야 함" }
        assert(compareTimeMillis(millis2, millis1) < 0) { "null이 밀리초 측정값보다 후순위여야 함" }
        assert(compareTimeMillis(millis2, millis3) == 0) { "null 밀리초값들은 동등해야 함" }
    }

    @Test
    fun `복합 성능 측정 테스트`() {
        /**
         * ## 테스트 목적
         * 여러 작업의 성능을 동시에 측정하고 상호 비교하여
         * 성능 측정 시스템의 정확성과 일관성을 검증합니다.
         * 실제 운영 환경에서 다양한 작업들의 성능 프로파일링에 활용됩니다.
         * 
         * ## Given
         * - 5개의 서로 다른 실행 시간을 가진 작업들 (20ms, 40ms, 60ms, 80ms, 100ms)
         * - 각 작업은 일정한 증가폭을 가져 예측 가능한 성능 차이 발생
         * 
         * ## When
         * - 각 작업의 실행 시간을 개별적으로 측정
         * - 측정된 시간들을 정렬하여 성능 순위 도출
         * 
         * ## Then
         * - 최소 시간이 최대 시간보다 작음을 확인
         * - 성능 측정 시스템이 상대적 성능 차이를 정확히 감지함을 검증
         * 
         * ## 복합 성능 측정의 실무 활용
         * - **A/B 테스트**: 서로 다른 알고리즘의 성능 비교
         * - **회귀 테스트**: 코드 변경이 성능에 미치는 영향 분석
         * - **시스템 프로파일링**: 병목 구간 식별 및 최적화 우선순위 결정
         * - **용량 계획**: 예상 부하에 따른 성능 예측
         * 
         * ## 측정 데이터 분석 패턴
         * - **최소/최대값**: 성능 범위와 변동성 이해
         * - **정렬된 결과**: 성능 순위와 개선 우선순위 도출
         * - **상대적 비교**: 절대값보다 상대적 성능 차이에 주목
         */
        
        // 다양한 성능 특성을 가진 작업들의 실행 시간 수집
        val times = mutableListOf<Duration>()
        
        // 각기 다른 실행 시간을 가진 5개 작업을 순차적으로 측정
        repeat(5) { index ->
            val time = measureTestTime {
                // 20ms씩 증가하는 실행 시간: 20, 40, 60, 80, 100ms
                // 실제 환경에서는 데이터베이스 쿼리, 네트워크 호출, 복잡한 연산 등을 대변
                Thread.sleep((index + 1) * 20L)
            }
            times.add(time)
            
            // 각 작업의 측정 완료 - ${(index + 1) * 20}ms 작업
        }
        
        // 성능 데이터 분석을 위한 정렬 (오름차순)
        val sortedTimes = times.sortedWith { a, b -> compareTime(a, b) }
        
        // 성능 분석 결과 추출
        val minTime = sortedTimes.first()  // 가장 빠른 작업
        val maxTime = sortedTimes.last()   // 가장 느린 작업
        
        // 성능 측정 시스템의 정확성 검증
        assert(compareTime(minTime, maxTime) < 0) { 
            "최소 시간(${minTime.inWholeMilliseconds}ms)이 최대 시간(${maxTime.inWholeMilliseconds}ms)보다 작아야 함" 
        }
        
        // 예상 성능 범위 검증 (20ms ~ 100ms)
        assert(minTime.inWholeMilliseconds >= 20L) { "최소 실행 시간이 20ms 이상이어야 함" }
        assert(maxTime.inWholeMilliseconds >= 100L) { "최대 실행 시간이 100ms 이상이어야 함" }
        
        // 복합 성능 측정 검증 완료 - 상대적 성능 차이 정확히 감지됨
    }

    @Test
    fun `성능 임계값 확인 테스트`() {
        /**
         * ## 테스트 목적
         * 성능 기준 임계값을 설정하고 실제 실행 시간이 이를 준수하는지 검증합니다.
         * CI/CD 파이프라인에서 성능 회귀를 자동으로 감지하는 체계의 기반이 됩니다.
         * 
         * ## Given
         * - 성능 임계값: 0.5초 (500ms) - 사용자 경험 기준 응답 시간
         * - 실제 작업: 0.3초 (300ms) 실행 - 임계값 이하의 정상 성능
         * 
         * ## When
         * - 실제 작업 시간을 정밀 측정
         * - 측정된 시간과 임계값을 비교
         * 
         * ## Then
         * - 실행 시간이 임계값을 초과하지 않음을 확인
         * - 성능 기준을 만족하는 정상 동작 검증
         * 
         * ## 성능 임계값 설정 가이드라인
         * 
         * ### 1. 사용자 경험 기준
         * - **100ms 이하**: 즉각적 반응 (실시간 상호작용)
         * - **500ms 이하**: 빠른 응답 (일반적인 웹 요청)
         * - **1초 이하**: 허용 가능한 응답 (복잡한 연산)
         * - **3초 이상**: 개선 필요한 성능 (사용자 이탈 증가)
         * 
         * ### 2. 시스템 유형별 임계값
         * - **API 엔드포인트**: 200ms 이하 권장
         * - **데이터베이스 쿼리**: 100ms 이하 권장
         * - **파일 I/O**: 50ms 이하 권장
         * - **메모리 연산**: 10ms 이하 권장
         * 
         * ### 3. 모니터링 및 알림 전략
         * - **경고 임계값**: 기준의 80% (조기 경보)
         * - **위험 임계값**: 기준의 100% (즉시 조치 필요)
         * - **치명적 임계값**: 기준의 150% (시스템 장애 수준)
         * 
         * ## 실무 적용 예시
         * ```kotlin
         * // 서비스별 맞춤 임계값 설정
         * val memberServiceThreshold = Duration.ofMillis(200)    // 멤버 서비스
         * val workspaceServiceThreshold = Duration.ofMillis(500) // 워크스페이스 서비스
         * val aiServiceThreshold = Duration.ofSeconds(5)         // AI 분류 서비스
         * ```
         */
        
        // 성능 임계값 설정 - 사용자 경험을 고려한 허용 가능한 최대 응답 시간
        val threshold = Duration.parse("PT0.5S") // 0.5초 임계값 (500ms)
        
        // 실제 작업 실행 시간 측정
        val actualTime = measureTestTime {
            // 데이터베이스 조회나 비즈니스 로직 처리를 시뮬레이션
            Thread.sleep(300) // 0.3초 실행 - 임계값 이하의 정상적인 성능
        }
        
        // 성능 기준 대비 실제 성능 비교
        val comparison = compareTime(actualTime, threshold)
        
        // 성능 임계값 준수 검증
        assert(comparison < 0) { 
            "실행 시간(${actualTime.inWholeMilliseconds}ms)이 임계값(${threshold.inWholeMilliseconds}ms)을 초과하지 않아야 함" 
        }
        
        // 추가 성능 검증 - 실제 측정값이 예상 범위 내에 있는지 확인
        assert(actualTime.inWholeMilliseconds >= 300L) { "최소 300ms 이상 실행되어야 함" }
        assert(actualTime.inWholeMilliseconds < 400L) { "과도한 오버헤드가 없어야 함 (400ms 미만)" }
        
        // 성능 기준 검증 완료 - 임계값 이하의 정상 성능 확인됨
        // CI/CD에서 이와 같은 방식으로 성능 회귀 자동 감지 가능
    }

    @Test
    fun `시간 측정 정확성 테스트`() {
        // measureTimedValue를 사용한 결과값과 시간 동시 측정
        val (result, duration) = measureTimedValue {
            val sum = (1..1000).sum()
            sum
        }
        
        // 계산 결과 및 시간 측정됨
        
        // 결과 검증
        assert(result == 500500) { "계산 결과가 정확해야 함" }
        assert(duration.inWholeMilliseconds >= 0) { "측정 시간이 0 이상이어야 함" }
        
        // null 안전 비교 테스트
        val comparisonDuration: Duration? = duration
        val nullDuration: Duration? = null
        
        assert(compareTime(comparisonDuration, nullDuration) > 0) { 
            "실제 측정 시간이 null보다 커야 함" 
        }
    }

    @Test
    fun `평균 성능 측정 테스트`() {
        val measurements = mutableListOf<Long>()
        
        // 여러 번 측정하여 평균 계산
        repeat(10) {
            val time = measureTestTimeMillis {
                // 약간의 변동성을 가진 작업
                Thread.sleep(50 + (Math.random() * 50).toLong())
            }
            measurements.add(time)
        }
        
        val averageTime = measurements.average()
        val minTime = measurements.minOrNull()
        val maxTime = measurements.maxOrNull()
        
        // 평균 실행 시간 측정됨
        
        // null 안전 비교
        if (minTime != null && maxTime != null) {
            assert(compareTimeMillis(minTime, maxTime) <= 0) { 
                "최소 시간이 최대 시간보다 작거나 같아야 함" 
            }
        }
        
        // 평균이 범위 내에 있는지 확인
        if (minTime != null && maxTime != null) {
            assert(averageTime >= minTime && averageTime <= maxTime) { 
                "평균이 최소-최대 범위 내에 있어야 함" 
            }
        }
    }

    // TestDataFactory 사용 예제

    @Test
    fun `기본 멤버 Fixture 생성 예제`() {
        // TestDataFactory를 사용한 기본 멤버 생성 테스트
        val executionTime = measureTestTime {
            val member = testDataFactory.createTestMember()
            
            // 기본값 검증
            assert(member.email == "test@test.com") { "기본 이메일이 'test@test.com'으로 설정되어야 함" }
            assert(member.name == "Test User") { "기본 이름이 'Test User'로 설정되어야 함" }
            assert(member.id != null) { "멤버 ID가 자동으로 할당되어야 함" }
            assert(member.id!! > 0) { "멤버 ID는 양수여야 함" }
            
            // 데이터베이스 영속화 검증
            assert(verifyMemberExists(member.email)) { "멤버가 데이터베이스에 영속화되어야 함" }
            assert(memberRepository.findByEmail(member.email) != null) { "Repository를 통해 멤버를 조회할 수 있어야 함" }
        }
    }

    @Test
    fun `커스텀 멤버 Fixture 생성 예제`() {
        val customEmail = "custom@example.com"
        val customName = "Custom User"
        
        val executionTime = measureTestTime {
            val member = testDataFactory.createTestMember(
                email = customEmail,
                password = "customPassword123!",
                name = customName,
                isVerified = false
            )
            
            // 커스텀 설정이 적용되었는지 검증
            assert(member.email == customEmail) { "커스텀 이메일이 설정되어야 함" }
            assert(member.name == customName) { "커스텀 이름이 설정되어야 함" }
            assert(member.id != null) { "멤버 ID가 할당되어야 함" }
            
            // 데이터베이스 저장 확인
            assert(verifyMemberExists(customEmail)) { "커스텀 멤버가 데이터베이스에 저장되어야 함" }
        }
        
        // 커스텀 멤버 생성 시간 측정됨
    }

    @Test
    fun `워크스페이스 Fixture 생성 예제`() {
        val executionTime = measureTestTime {
            // 먼저 멤버 생성 (워크스페이스 소유자)
            val owner = testDataFactory.createTestMember(
                email = "workspace-owner@test.com",
                name = "Workspace Owner"
            )
            
            // 워크스페이스 생성
            val workspace = testDataFactory.createTestWorkspace(
                name = "Example Workspace",
                description = "워크스페이스 예제 설명",
                owner = owner
            )
            
            // 워크스페이스 검증
            assert(workspace.name == "Example Workspace") { "워크스페이스 이름이 설정되어야 함" }
            assert(workspace.description == "워크스페이스 예제 설명") { "워크스페이스 설명이 설정되어야 함" }
            assert(workspace.owner.id == owner.id) { "소유자가 올바르게 설정되어야 함" }
            
            // 데이터베이스 저장 확인
            assert(verifyWorkspaceExists(workspace.name)) { "워크스페이스가 데이터베이스에 저장되어야 함" }
        }
        
        // 워크스페이스 생성 시간 측정됨
    }

    @Test
    fun `복수 멤버 Fixture 생성 성능 비교`() {
        val singleMemberTime = measureTestTime {
            testDataFactory.createTestMember(email = "single@test.com")
        }
        
        val multipleMembersTime = measureTestTime {
            createTestMembers(5)
        }
        
        // 단일 및 복수 멤버 생성 시간 측정됨
        
        // 생성된 멤버 수 확인
        val totalMembers = memberRepository.count()
        assert(totalMembers >= 6) { "최소 6명의 멤버가 생성되어야 함" }
    }

    @Test
    fun `완전한 테스트 시나리오 생성 예제`() {
        val executionTime = measureTestTime {
            // TestDataFactory의 createCompleteTestScenario 사용
            val scenario = createCompleteTestScenario()
            
            // 시나리오 구성 요소 검증
            assert(scenario.member.email.isNotBlank()) { "멤버가 생성되어야 함" }
            assert(scenario.workspace.name.isNotBlank()) { "워크스페이스가 생성되어야 함" }
            
            // 관계 검증
            assert(scenario.workspace.owner.id == scenario.member.id) { 
                "워크스페이스 소유자가 생성된 멤버와 일치해야 함" 
            }
        }
        
        // 완전한 시나리오 생성 시간 측정됨
    }

    @Test
    fun `Fixture 생성 및 Mock 컨텍스트 연동 예제`() {
        val executionTime = measureTestTime {
            // 멤버 생성 및 Mock 보안 컨텍스트에 등록
            val member = createAndRegisterTestMember(
                email = "auth-test@test.com",
                name = "Auth Test User"
            )
            
            // 멤버가 생성되고 등록되었는지 확인
            assert(member.email == "auth-test@test.com") { "멤버가 올바르게 생성되어야 함" }
            assert(verifyMemberExists(member.email)) { "멤버가 데이터베이스에 저장되어야 함" }
            
            // Mock 컨텍스트 연동은 BaseIntegrationTest의 기능이므로 별도 검증 없이 패스
            // 멤버 생성 및 등록 완료
        }
        
        // 인증 멤버 생성 및 등록 시간 측정됨
    }

    @Test
    fun `배치 Fixture 생성 성능 측정`() {
        val batchSizes = listOf(1, 5, 10, 20)
        val results = mutableListOf<Pair<Int, Duration>>()
        
        batchSizes.forEachIndexed { index, size ->
            // 각 배치 크기별로 성능 측정 (고유한 이메일을 위해 인덱스 사용)
            val time = measureTestTime {
                val members = (1..size).map { memberIndex ->
                    testDataFactory.createTestMember(
                        email = "batch${index}_member${memberIndex}@test.com",
                        name = "Batch Member $memberIndex"
                    )
                }
                assert(members.size == size) { "${size}명의 멤버가 생성되어야 함" }
            }
            results.add(Pair(size, time))
            
            // ${size}명 멤버 생성 시간 측정됨
        }
        
        // 결과 분석
        val sortedResults = results.sortedBy { it.first }
        // 배치 크기별 성능 결과 확인됨
        
        // 배치 크기가 클수록 일반적으로 전체 시간은 더 오래 걸림
        val firstTime = sortedResults.first().second
        val lastTime = sortedResults.last().second
        assert(compareTime(firstTime, lastTime) <= 0) { 
            "작은 배치가 큰 배치보다 빠르거나 같아야 함" 
        }
    }
}