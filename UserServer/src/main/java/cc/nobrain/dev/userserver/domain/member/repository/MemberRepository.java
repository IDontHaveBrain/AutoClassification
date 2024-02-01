package cc.nobrain.dev.userserver.domain.member.repository;

import cc.nobrain.dev.userserver.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {
    Boolean existsByEmail(String email);
}