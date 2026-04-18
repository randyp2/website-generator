package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillRepository extends JpaRepository<Skill, UUID> {
    /**
     * Try canonical name first: "PostgreSQL", "React", etc.
     * - Exact match found
     */
    @Query("""
            SELECT s FROM Skill s 
            WHERE lower(s.name) = lower(:name)
    """)
    Optional<Skill> findByNameIgnoreCase(String name);

    /**
     * Fall back to alias table: "JS" → JavaScript
     * "K8s" → Kubernetes, etc.
     */
    @Query("""
          SELECT s FROM Skill s
          JOIN SkillAlias sa ON sa.skillId = s.id
          WHERE lower(sa.alias) = lower(:alias)
      """)
    Optional<Skill> findByAliasIgnoreCase(String alias);

    /**
     * Load all alias phrases for a canonical skill id.
     */
    @Query("""
          SELECT sa.alias FROM SkillAlias sa
          WHERE sa.skillId = :skillId
      """)
    List<String> findAliasesBySkillId(UUID skillId);

}
