package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.entity.ResumeVerification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResumeVerificationMapper {
    @Mapping(source = "profile.id", target = "profileId")
    ResumeVerificationDTO toDto(ResumeVerification resumeVerification);
}
