package com.webgen.webgen_backend.agent.dto.tool.recordstylepreference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordStylePreferenceToolInputDTO {
    private String designGoal;
    private Map<String, String> colors;
    private Map<String, String> fonts;
    private String layout;
}
