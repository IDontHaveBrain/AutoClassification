package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.common.BaseIntegrationTest
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable

class NoticeServiceImplTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var noticeService: NoticeService

    @Test
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

        // Then: 결과가 올바르게 반환되어야 함
        assertNotNull(result)
        assertTrue(result.content.isNotEmpty())
        assertTrue(result.content.any { notice -> notice.title?.contains("Sample") == true })
    }

    @Test
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

        // Then: 데이터베이스에 공지사항이 저장되어야 함
        val finalCount = noticeRepository.count()
        assertEquals(initialCount + 1, finalCount)
        
        val savedNotice = noticeRepository.findAll().first { notice -> notice.title == "Sample Notice Title" }
        assertEquals("Sample Notice Title", savedNotice.title)
        assertEquals("This is a sample content for the notice.", savedNotice.content)
        assertEquals(false, savedNotice.sticky)
    }

    @Test
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

        // Then: 공지사항이 업데이트되어야 함
        val updatedNotice = noticeRepository.findById(existingNotice.id!!).orElse(null)
        assertNotNull(updatedNotice)
        assertEquals("Updated Notice Title", updatedNotice.title)
        assertEquals("This is the updated content for the notice.", updatedNotice.content)
        assertEquals(true, updatedNotice.sticky)
    }

    @Test
    fun `deleteNotice should delete an existing notice`() = runBlocking {
        // Given: 기존 공지사항을 데이터베이스에 저장
        val existingNotice = testDataFactory.createTestNotice(
            title = "Notice to Delete",
            content = "This notice will be deleted."
        )
        
        // 생성된 공지사항이 존재하는지 확인
        assertTrue(noticeRepository.existsById(existingNotice.id!!))

        // When: 공지사항을 삭제
        noticeService.deleteNotice(existingNotice.id!!)

        // Then: 공지사항이 삭제되어야 함
        assertFalse(noticeRepository.existsById(existingNotice.id!!))
        
        // 추가 검증: 삭제된 공지사항을 조회하면 null이어야 함
        val deletedNotice = noticeRepository.findById(existingNotice.id!!).orElse(null)
        assertNull(deletedNotice)
    }

    @Test
    fun `createNotice should throw CustomException when create request is null`(): Unit = runBlocking {
        // Given: null 생성 요청
        
        // When & Then: CustomException이 발생해야 함
        val exception = assertThrows<CustomException> {
            runBlocking { noticeService.createNotice(null) }
        }
        assertEquals("Invalid Data", exception.message)
    }

    @Test
    fun `updateNotice should throw CustomException when notice not found`(): Unit = runBlocking {
        // Given: 존재하지 않는 공지사항 ID
        val nonExistentId = 999999L
        val updateReq = NoticeReq.Create(
            title = "Updated Notice Title",
            content = "This is the updated content for the notice.",
            sticky = false,
            attachments = null
        )
        
        // 해당 ID의 공지사항이 존재하지 않는지 확인
        assertFalse(noticeRepository.existsById(nonExistentId))

        // When & Then: CustomException이 발생해야 함
        assertThrows<CustomException> {
            noticeService.updateNotice(nonExistentId, updateReq)
        }
    }
}
