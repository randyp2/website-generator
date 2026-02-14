package com.webgen.webgen_backend.portfolio_service.style;

import com.webgen.webgen_backend.dto.portfolio.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.model.portfolio.style.StyleContext;

import java.util.UUID;

public interface StyleChatService {
    StyleChatResponseDTO chat(StyleChatRequestDTO req);
    StyleContext getContext(UUID portfolioId);
}
