package com.webgen.webgen_backend.portfolio.mapper;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.entity.Asset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssetMapper {
    @Mapping(source = "fileUrl", target = "url")
    @Mapping(source = "fileType", target = "type")
    AssetDTO toDto(Asset asset);
}
