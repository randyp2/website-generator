package com.webgen.webgen_backend.dto.portfolio;

import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
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
