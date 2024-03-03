package cc.nobrain.dev.userserver.domain.train.service

import cc.nobrain.dev.userserver.common.component.FileComponent
import cc.nobrain.dev.userserver.common.exception.CustomException
import cc.nobrain.dev.userserver.common.exception.ErrorInfo
import cc.nobrain.dev.userserver.common.utils.MemberUtil
import cc.nobrain.dev.userserver.domain.base.dto.FileDto
import cc.nobrain.dev.userserver.domain.member.entity.Member
import cc.nobrain.dev.userserver.domain.member.repository.MemberRepository
import cc.nobrain.dev.userserver.domain.train.entity.TrainFile
import cc.nobrain.dev.userserver.domain.train.repository.TrainFileRepository
import org.modelmapper.ModelMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
@Transactional(readOnly = true)
class TrainServiceImpl(
    private val trainFileRepository: TrainFileRepository,
    private val fileComponent: FileComponent,
    private val memberRepository: MemberRepository,
    private val modelMapper: ModelMapper
) : TrainService {

    @Transactional
    override fun uploadTrainData(files: Array<MultipartFile>): List<FileDto> {
        var member = MemberUtil.getCurrentMember()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        member = memberRepository.findById(member.id)
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val success = fileComponent.uploadFile(files, TrainFile::class.java, member)

        return success.stream().map { file -> modelMapper.map(file, FileDto::class.java) }.toList()
    }

    override fun getMyImgs(): List<FileDto> {
        val member = MemberUtil.getCurrentMember()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val files = trainFileRepository.findByOwnerIndexId(member.id)
        return files.stream().map { file -> modelMapper.map(file, FileDto::class.java) }.toList()
    }

    override fun requestTrain(): List<FileDto> {
        val member = MemberUtil.getCurrentMember()
            .orElseThrow { CustomException(ErrorInfo.LOGIN_USER_NOT_FOUND) }

        val files = trainFileRepository.findByOwnerIndexId(member.id);

//        if ()

        return files.stream().map { file -> modelMapper.map(file, FileDto::class.java) }.toList()
    }
}