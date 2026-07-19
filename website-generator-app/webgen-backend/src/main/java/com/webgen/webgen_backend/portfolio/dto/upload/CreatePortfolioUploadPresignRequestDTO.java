package com.webgen.webgen_backend.portfolio.dto.upload;

import lombok.Data;

import java.util.List;

/** Batch request for scoped Supabase upload tokens. */
@Data
public class CreatePortfolioUploadPresignRequestDTO {
    private List<PortfolioUploadDescriptorDTO> files;
}
