package com.webgen.webgen_backend.portfolio.dto.common;

import lombok.Data;

import java.util.List;

@Data
public class AssistantMessageDTO {
    String summary;
    List<String> suggestions;
}
