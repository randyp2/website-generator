package com.webgen.webgen_backend.agent.dto.tool;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StyleChatToolInputDTO {
    private String userMessage;
    private Map<String, String> colorSelections;
    private Map<String, String> fontSelections;
    private String layoutSelection;
}
