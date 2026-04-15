package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.entity.ConnectedAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConnectedAccountMapper {

    // Map persistence model to API-safe connected-account DTO.
    @Mapping(source = "profile.id", target = "profileId")
    @Mapping(
            target = "scopes",
            expression = "java(account.getScopes() == null ? java.util.List.of() : java.util.Arrays.asList(account.getScopes()))"
    )
    ConnectedAccountDTO toDto(ConnectedAccount account);
}
