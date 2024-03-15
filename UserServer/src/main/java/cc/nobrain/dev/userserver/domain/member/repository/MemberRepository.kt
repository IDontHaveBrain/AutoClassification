package cc.nobrain.dev.userserver.domain.member.repository

import cc.nobrain.dev.userserver.domain.member.entity.Member
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface MemberRepository : JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {
    fun existsByEmail(email: String): Boolean

    fun deleteByEmail(email: String): Long

    fun findByEmail(email: String): Member?


    fun findByEmailIn(emails: MutableCollection<String>): List<Member>


    fun findByEmailLike(email: String): List<Member>


    fun findByEmailLikeIgnoreCase(email: String, pageable: Pageable): Page<Member>
}