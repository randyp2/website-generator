package com.webgen.webgen_backend.verification.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AddSkillClaimRequestDTO {
    private UUID resumeVerificationId;
    private String skill;
}
