package cc.nobrain.dev.userserver.domain.notice.service.dto

import cc.nobrain.dev.userserver.domain.base.dto.BaseDto
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.validation.constraints.NotNull
import lombok.NoArgsConstructor
import java.io.Serializable

/**
 *
 */


open class NoticeDto @JvmOverloads constructor(
    var id: Long = 0,
    @NotNull var title: String = "",
    var content: String? = null,
    var sticky: Boolean? = null
) : BaseDto(), Serializable