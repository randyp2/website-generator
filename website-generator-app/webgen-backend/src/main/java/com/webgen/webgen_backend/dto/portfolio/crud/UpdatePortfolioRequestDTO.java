package com.webgen.webgen_backend.dto.portfolio.crud;

import com.webgen.webgen_backend.entity.portfolio.StyleChatMessage;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePortfolioRequestDTO {
    private String title;
    private String lastStep;
    private String templateId;
    private List<StyleChatMessage> styleChatHistory;
    private String description;
}
