package com.webgen.webgen_backend.verification.mapper;

import com.webgen.webgen_backend.verification.dto.ResumeVerificationDTO;
import com.webgen.webgen_backend.verification.entity.ResumeVerification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResumeVerificationMapper {
    @Mapping(source = "profile.id", target = "profileId")
    ResumeVerificationDTO toDto(ResumeVerification resumeVerification);
}
