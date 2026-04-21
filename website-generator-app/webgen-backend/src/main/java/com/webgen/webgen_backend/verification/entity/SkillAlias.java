package com.webgen.webgen_backend.verification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_aliases", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class SkillAlias {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @Column(name = "alias", nullable = false)
    private String alias;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
