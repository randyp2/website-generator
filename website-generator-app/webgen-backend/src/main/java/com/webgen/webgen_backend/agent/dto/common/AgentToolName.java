package com.webgen.webgen_backend.agent.dto.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AgentToolName {
    STYLE_CHAT("style_chat_tool"),
    RESUME_PARSE("resume_parse_tool"),
    BUILD_BLUEPRINT("build_blueprint_tool"),
    GENERATE_PORTFOLIO("generate_portfolio_tool"),
    UNKNOWN("unknown");

    private final String wireName;

    AgentToolName(String wireName) {
        this.wireName = wireName;
    }

    @JsonValue
    public String getWireName() {
        return wireName;
    }

    @JsonCreator
    public static AgentToolName fromJson(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return UNKNOWN;
        }

        String normalized = rawValue.trim();
        for (AgentToolName toolName : values()) {
            if (toolName.wireName.equalsIgnoreCase(normalized) || toolName.name().equalsIgnoreCase(normalized)) {
                return toolName;
            }
        }
        return UNKNOWN;
    }
}
