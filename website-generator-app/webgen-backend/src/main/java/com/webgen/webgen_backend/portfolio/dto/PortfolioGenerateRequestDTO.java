package com.webgen.webgen_backend.portfolio.dto;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class PortfolioGenerateRequestDTO {

    String templateId; // base template
    ParsedResumeDTO resume; // parsed resume info
    String userPrompt; // prompt -> refine -> send
    Map<String, String> stylePrefs;

    List<AssetDTO> assets; // media assets impl later
}
