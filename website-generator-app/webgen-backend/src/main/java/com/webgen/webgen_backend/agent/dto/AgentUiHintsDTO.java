package com.webgen.webgen_backend.agent.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentUiHintsDTO {

    private Boolean requestedResumeUpload;
    private Boolean requestedManualContext;
    private String blockedOn;
}
