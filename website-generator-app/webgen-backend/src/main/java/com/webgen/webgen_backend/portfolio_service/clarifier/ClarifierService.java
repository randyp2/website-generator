package com.webgen.webgen_backend.portfolio_service.clarifier;

import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;

public interface ClarifierService {
    ClarifierResponseDTO clarify(ClarifierRequestDTO req);
    ClarifierContext getContext(String sessionId);
}
