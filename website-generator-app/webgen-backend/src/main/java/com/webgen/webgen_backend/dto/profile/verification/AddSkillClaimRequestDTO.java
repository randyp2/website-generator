package com.webgen.webgen_backend.dto.profile.verification;

import lombok.Data;

import java.util.UUID;

@Data
public class AddSkillClaimRequestDTO {
    private UUID resumeVerificationId;
    private String skill;
}
