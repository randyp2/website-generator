package com.webgen.webgen_backend.portfolio_service.builder;

import com.webgen.webgen_backend.dto.portfolio.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;

public interface BuilderService {
    BuilderResponseDTO build(BuilderRequestDTO req);
}
