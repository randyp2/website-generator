package com.webgen.webgen_backend.agent.dto.tool;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.ai.tool.annotation.ToolParam;

import java.util.Map;

/**
 * Tool input contract for style discovery actions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StyleChatToolInputDTO {

    @ToolParam(required = false, description = "User message for style discovery conversation")
    private String userMessage;

    @ToolParam(required = false, description = "Selected color tokens such as primary, secondary, accent, background, text, and muted")
    private Map<String, String> colorSelections;

    @ToolParam(required = false, description = "Selected fonts such as heading and body")
    private Map<String, String> fontSelections;

    @ToolParam(required = false, description = "Selected layout style such as Spacious, Compact, Bento, Masonry, or Dynamic")
    private String layoutSelection;
}
