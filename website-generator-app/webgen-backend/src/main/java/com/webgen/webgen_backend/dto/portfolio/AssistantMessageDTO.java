package com.webgen.webgen_backend.dto.portfolio;

import lombok.Data;

import java.util.List;

@Data
public class AssistantMessageDTO {
    String summary;
    List<String> suggestions;
}
