package cc.nobrain.dev.userserver.domain.notice.service

import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.domain.notice.entity.Notice
import cc.nobrain.dev.userserver.domain.notice.repository.NoticeRepository
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeReq
import cc.nobrain.dev.userserver.domain.notice.service.dto.NoticeRes
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.modelmapper.ModelMapper
import java.util.*
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@Transactional
class NoticeServiceImplTest {

    private val noticeRepository: NoticeRepository = mock(NoticeRepository::class.java)
    private val modelMapper: ModelMapper = mock(ModelMapper::class.java)
    private val noticeService: NoticeServiceImpl = NoticeServiceImpl(noticeRepository, modelMapper)

    @Test
    fun `searchNoticeList should return a page of NoticeRes`(): Unit = runBlocking {
        val search = NoticeReq.Search(title = "Sample Title", createMember = "User")
        val pageable: Pageable = mock(Pageable::class.java)
        val notice: Notice = Notice(title = "Sample Notice Title")
        val noticeRes: NoticeRes = NoticeRes()
        val page: Page<Notice> = mock(Page::class.java) as Page<Notice>

        `when`(noticeRepository.findAll(any(), eq(pageable))).thenReturn(page)
        `when`(modelMapper.map(notice, NoticeRes::class.java)).thenReturn(noticeRes)

        val result = noticeService.searchNoticeList(search, pageable)

        assertNotNull(result)
        verify(noticeRepository).findAll(any(), eq(pageable))
    }

    @Test
    fun `createNotice should save a new notice`(): Unit = runBlocking {
        val createReq = NoticeReq.Create(
            title = "Sample Notice Title",
            content = "This is a sample content for the notice.",
            sticky = false,
            attachments = null
        )
        val notice: Notice = Notice(title = "Sample Notice Title", content = "This is a sample content for the notice.")

        `when`(modelMapper.map(createReq, Notice::class.java)).thenReturn(notice)

        noticeService.createNotice(createReq)

        verify(noticeRepository).save(notice)
    }

    @Test
    fun `updateNotice should update an existing notice`(): Unit = runBlocking {
        val id = 1L
        val updateReq = NoticeReq.Create(
            title = "Updated Notice Title",
            content = "This is the updated content for the notice.",
            sticky = false,
            attachments = null
        )
        val existingNotice: Notice = Notice(
            title = "Existing Notice Title",
            content = "This is the existing content for the notice."
        )

        `when`(noticeRepository.findById(id)).thenReturn(Optional.of(existingNotice))

        noticeService.updateNotice(id, updateReq)

        verify(noticeRepository).save(existingNotice)
    }

    @Test
    fun `deleteNotice should delete an existing notice`() = runBlocking {
        val id = 1L

        noticeService.deleteNotice(id)

        verify(noticeRepository).deleteById(id)
    }

    @Test
    fun `createNotice should throw CustomException when create request is null`(): Unit = runBlocking {
        val exception = assertThrows<CustomException> {
            runBlocking { noticeService.createNotice(null) }
        }
        assertEquals("Invalid Data", exception.message)
    }

    @Test
    fun `updateNotice should throw CustomException when notice not found`(): Unit = runBlocking {
        val id = 1L
        val updateReq = NoticeReq.Create(
            title = "Updated Notice Title",
            content = "This is the updated content for the notice.",
            sticky = false,
            attachments = null
        )

        `when`(noticeRepository.findById(id)).thenReturn(Optional.empty())

        assertThrows<CustomException> {
            noticeService.updateNotice(id, updateReq)
        }
    }
}
