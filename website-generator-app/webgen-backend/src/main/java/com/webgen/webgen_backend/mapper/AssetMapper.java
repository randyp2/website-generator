package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import com.webgen.webgen_backend.entity.Asset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssetMapper {
    @Mapping(source = "fileUrl", target = "url")
    @Mapping(source = "fileType", target = "type")
    AssetDTO toDto(Asset asset);
}
