package com.webgen.webgen_backend.portfolio.service.style;

import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;

import java.util.UUID;

public interface StyleChatService {
    StyleChatResponseDTO chat(StyleChatRequestDTO req);
    StyleContext getContext(UUID portfolioId);
}
