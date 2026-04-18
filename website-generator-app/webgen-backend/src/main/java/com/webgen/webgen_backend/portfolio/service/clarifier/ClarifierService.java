package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;

public interface ClarifierService {
    ClarifierResponseDTO clarify(ClarifierRequestDTO req);
    ClarifierContext getContext(String sessionId);
}
