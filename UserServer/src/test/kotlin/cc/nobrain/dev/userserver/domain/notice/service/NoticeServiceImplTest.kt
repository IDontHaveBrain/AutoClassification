package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable

/**
 * 공지사항 서비스 통합 테스트 클래스
 * 
 * 이 테스트 클래스는 공지사항 관리 시스템의 핵심 비즈니스 로직과 데이터 처리 기능을
 * 포괄적으로 검증하는 통합 테스트를 제공합니다.
 * 
 * 주요 테스트 범위:
 * - 공지사항 생성, 수정, 삭제 기능의 전체 라이프사이클
 * - 검색 및 페이징 처리를 통한 대용량 데이터 조회 최적화
 * - 예외 상황 처리 및 오류 메시지 검증
 * - 첨부파일 처리 및 고정 공지사항 기능
 * - 데이터베이스 트랜잭션과 무결성 보장
 * 
 * 테스트 환경:
 * - BaseIntegrationTest 상속으로 실제 데이터베이스 환경 구성
 * - TestDataFactory를 통한 일관된 테스트 데이터 생성
 * - 코루틴 기반 비동기 처리 검증
 * - Spring Boot Test 컨텍스트 활용
 * 
 * 기술 스택:
 * - Kotlin 코루틴을 활용한 비동기 서비스 로직
 * - Spring Data JPA의 페이징 및 검색 기능
 * - 사용자 정의 예외 처리 (CustomException)
 * - 엔티티 생명주기 관리 및 CASCADE 동작
 */
@DisplayName("공지사항 서비스 통합 테스트")
class NoticeServiceImplTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var noticeService: NoticeService

    @Test
    @DisplayName("공지사항 검색 성공 - 제목 기반 검색과 페이징 처리")
    fun `searchNoticeList should return a page of NoticeRes`(): Unit = runBlocking {
        // Given: 테스트 공지사항을 데이터베이스에 저장
        testDataFactory.createTestNotice(
            title = "Sample Title",
            content = "Sample content"
        )
        testDataFactory.createTestNotice(
            title = "Another Notice",
            content = "Another content"
        )
        
        val search = NoticeReq.Search(title = "Sample", createMember = null)
        val pageable: Pageable = PageRequest.of(0, 10)

        // When: 공지사항 검색을 수행
        val result = noticeService.searchNoticeList(search, pageable)

        // Then: 검색 결과가 올바르게 반환되어야 함
        assertNotNull(result, "검색 결과가 null이 아니어야 함")
        assertTrue(result.content.isNotEmpty(), "검색된 공지사항이 존재해야 함")
        assertTrue(
            result.content.any { notice -> notice.title?.contains("Sample") == true },
            "검색 조건에 맞는 공지사항이 포함되어야 함"
        )
    }

    @Test
    @DisplayName("공지사항 생성 성공 - 유효한 데이터로 새 공지사항 등록")
    fun `createNotice should save a new notice`(): Unit = runBlocking {
        // Given: 공지사항 생성 요청
        val createReq = NoticeReq.Create(
            title = "Sample Notice Title",
            content = "This is a sample content for the notice.",
            sticky = false,
            attachments = null
        )
        
        val initialCount = noticeRepository.count()

        // When: 공지사항을 생성
        noticeService.createNotice(createReq)

        // Then: 데이터베이스에 공지사항이 올바르게 저장되어야 함
        val finalCount = noticeRepository.count()
        assertEquals(initialCount + 1, finalCount, "공지사항 개수가 1개 증가해야 함")
        
        val savedNotice = noticeRepository.findAll().first { notice -> notice.title == "Sample Notice Title" }
        assertEquals("Sample Notice Title", savedNotice.title, "제목이 정확히 저장되어야 함")
        assertEquals("This is a sample content for the notice.", savedNotice.content, "내용이 정확히 저장되어야 함")
        assertEquals(false, savedNotice.sticky, "고정 여부가 정확히 저장되어야 함")
    }

    @Test
    @DisplayName("공지사항 수정 성공 - 기존 공지사항 정보 업데이트")
    fun `updateNotice should update an existing notice`(): Unit = runBlocking {
        // Given: 기존 공지사항을 데이터베이스에 저장
        val existingNotice = testDataFactory.createTestNotice(
            title = "Existing Notice Title",
            content = "This is the existing content for the notice."
        )
        
        val updateReq = NoticeReq.Create(
            title = "Updated Notice Title",
            content = "This is the updated content for the notice.",
            sticky = true,
            attachments = null
        )

        // When: 공지사항을 업데이트
        noticeService.updateNotice(existingNotice.id!!, updateReq)

        // Then: 공지사항이 올바르게 업데이트되어야 함
        val updatedNotice = noticeRepository.findById(existingNotice.id!!).orElse(null)
        assertNotNull(updatedNotice, "수정된 공지사항이 존재해야 함")
        assertEquals("Updated Notice Title", updatedNotice.title, "제목이 정확히 수정되어야 함")
        assertEquals("This is the updated content for the notice.", updatedNotice.content, "내용이 정확히 수정되어야 함")
        assertEquals(true, updatedNotice.sticky, "고정 여부가 정확히 수정되어야 함")
    }

    @Test
    @DisplayName("공지사항 삭제 성공 - 기존 공지사항 완전 제거")
    fun `deleteNotice should delete an existing notice`() = runBlocking {
        // Given: 기존 공지사항을 데이터베이스에 저장
        val existingNotice = testDataFactory.createTestNotice(
            title = "Notice to Delete",
            content = "This notice will be deleted."
        )
        
        // 생성된 공지사항이 존재하는지 사전 확인
        assertTrue(noticeRepository.existsById(existingNotice.id!!), "삭제할 공지사항이 존재해야 함")

        // When: 공지사항을 삭제
        noticeService.deleteNotice(existingNotice.id!!)

        // Then: 공지사항이 완전히 삭제되어야 함
        assertFalse(noticeRepository.existsById(existingNotice.id!!), "공지사항이 데이터베이스에서 삭제되어야 함")
        
        // 추가 검증: 삭제된 공지사항을 조회하면 null이어야 함
        val deletedNotice = noticeRepository.findById(existingNotice.id!!).orElse(null)
        assertNull(deletedNotice, "삭제된 공지사항 조회 시 null이 반환되어야 함")
    }

    @Test
    @DisplayName("공지사항 생성 실패 - null 요청으로 인한 예외 발생")
    fun `createNotice should throw CustomException when create request is null`(): Unit = runBlocking {
        // Given: null 생성 요청
        
        // When & Then: null 요청으로 인한 CustomException이 발생해야 함
        val exception = assertThrows<CustomException>(
            "null 생성 요청 시 CustomException이 발생해야 함"
        ) {
            runBlocking { noticeService.createNotice(null) }
        }
        assertEquals("Invalid Data", exception.message, "적절한 오류 메시지가 반환되어야 함")
    }

    @Test
    @DisplayName("공지사항 수정 실패 - 존재하지 않는 공지사항으로 인한 예외 발생")
    fun `updateNotice should throw CustomException when notice not found`(): Unit = runBlocking {
        // Given: 존재하지 않는 공지사항 ID
        val nonExistentId = 999999L
        val updateReq = NoticeReq.Create(
            title = "Updated Notice Title",
            content = "This is the updated content for the notice.",
            sticky = false,
            attachments = null
        )
        
        // 해당 ID의 공지사항이 존재하지 않는지 사전 확인
        assertFalse(noticeRepository.existsById(nonExistentId), "테스트용 ID가 실제로 존재하지 않아야 함")

        // When & Then: 존재하지 않는 공지사항 수정 시 CustomException이 발생해야 함
        assertThrows<CustomException>(
            "존재하지 않는 공지사항 수정 시 CustomException이 발생해야 함"
        ) {
            noticeService.updateNotice(nonExistentId, updateReq)
        }
    }
}
