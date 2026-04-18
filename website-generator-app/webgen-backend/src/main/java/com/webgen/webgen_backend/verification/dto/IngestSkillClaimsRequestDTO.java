package com.webgen.webgen_backend.verification.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class IngestSkillClaimsRequestDTO {
    private UUID resumeVerificationId;
    private List<String> skills;
}
