package com.webgen.webgen_backend.profile.mapper;

import com.webgen.webgen_backend.profile.dto.ProfileMeDTO;
import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.entity.Profile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileMeDTO toMeDto(Profile profile);

    PublicProfileDTO toPublicDto(Profile profile);
}
