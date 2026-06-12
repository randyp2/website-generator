package com.webgen.webgen_backend.agent.tools.style;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.agent.dto.tool.recordstylepreference.RecordStylePreferenceToolInputDTO;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import com.webgen.webgen_backend.agent.repository.AgentSessionRepository;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AgentStyleMemoryStore {

    private static final String STYLE_KEY = "style";
    private static final String DESIGN_GOAL_KEY = "designGoal";
    private static final String COLORS_KEY = "colors";
    private static final String FONTS_KEY = "fonts";
    private static final String LAYOUT_KEY = "layout";

    private final AgentSessionRepository agentSessionRepository;
    private final PortfolioRepository portfolioRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> loadStyle(UUID portfolioId) {
        AgentSession session = lockOrCreateActiveSession(portfolioId);
        return toMap(styleObject(session.getMemoryJson() == null ? null : session.getMemoryJson().get(STYLE_KEY)));
    }

    @Transactional
    public String loadDesignGoal(UUID portfolioId) {
        AgentSession session = lockOrCreateActiveSession(portfolioId);
        ObjectNode style = styleObject(session.getMemoryJson() == null ? null : session.getMemoryJson().get(STYLE_KEY));
        JsonNode designGoal = style.get(DESIGN_GOAL_KEY);
        return designGoal == null || designGoal.isNull() ? null : designGoal.asText(null);
    }

    @Transactional
    public Map<String, Object> recordStyle(UUID portfolioId, RecordStylePreferenceToolInputDTO input) {
        AgentSession session = lockOrCreateActiveSession(portfolioId);
        AgentSession lockedSession = agentSessionRepository.findByIdForUpdate(session.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Active agent session disappeared during style memory save"));

        ObjectNode memoryJson = lockedSession.getMemoryJson() != null && lockedSession.getMemoryJson().isObject()
                ? (ObjectNode) lockedSession.getMemoryJson().deepCopy()
                : objectMapper.createObjectNode();
        ObjectNode style = styleObject(memoryJson.get(STYLE_KEY));

        if (input != null) {
            setTextIfPresent(style, DESIGN_GOAL_KEY, input.getDesignGoal());
            setObjectIfPresent(style, COLORS_KEY, input.getColors());
            setObjectIfPresent(style, FONTS_KEY, input.getFonts());
            setTextIfPresent(style, LAYOUT_KEY, input.getLayout());
        }

        memoryJson.set(STYLE_KEY, style);
        lockedSession.setMemoryJson(memoryJson);
        agentSessionRepository.save(lockedSession);
        return toMap(style);
    }

    public boolean isComplete(Map<String, Object> style) {
        return hasText(style, DESIGN_GOAL_KEY)
                && hasObject(style, COLORS_KEY)
                && hasObject(style, FONTS_KEY)
                && hasText(style, LAYOUT_KEY);
    }

    public String nextPickerHint(Map<String, Object> style) {
        if (!hasText(style, DESIGN_GOAL_KEY)) {
            return "design_goal";
        }
        if (!hasObject(style, COLORS_KEY)) {
            return "color_picker";
        }
        if (!hasObject(style, FONTS_KEY)) {
            return "typography_picker";
        }
        if (!hasText(style, LAYOUT_KEY)) {
            return "layout_picker";
        }
        return "complete";
    }

    private AgentSession lockOrCreateActiveSession(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        return agentSessionRepository
                .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                .map(existing -> agentSessionRepository.findByIdForUpdate(existing.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Active agent session disappeared during lock acquisition")))
                .orElseGet(() -> createActiveSessionWithRaceRecovery(portfolio));
    }

    private AgentSession createActiveSessionWithRaceRecovery(Portfolio portfolio) {
        AgentSession newSession = new AgentSession();
        newSession.setPortfolioId(portfolio.getId());
        newSession.setUserId(portfolio.getUserId());
        newSession.setStatus(AgentSessionStatus.ACTIVE);

        try {
            return agentSessionRepository.saveAndFlush(newSession);
        } catch (DataIntegrityViolationException exception) {
            return agentSessionRepository
                    .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                    .flatMap(existing -> agentSessionRepository.findByIdForUpdate(existing.getId()))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Failed to create or recover active agent session",
                            exception));
        }
    }

    private ObjectNode styleObject(JsonNode rawStyle) {
        return rawStyle != null && rawStyle.isObject()
                ? (ObjectNode) rawStyle.deepCopy()
                : objectMapper.createObjectNode();
    }

    private void setTextIfPresent(ObjectNode style, String key, String value) {
        if (value != null && !value.isBlank()) {
            style.put(key, value.trim());
        }
    }

    private void setObjectIfPresent(ObjectNode style, String key, Map<String, String> value) {
        if (value != null && !value.isEmpty()) {
            style.set(key, objectMapper.valueToTree(value));
        }
    }

    private Map<String, Object> toMap(ObjectNode style) {
        return objectMapper.convertValue(style, new TypeReference<Map<String, Object>>() {});
    }

    private boolean hasText(Map<String, Object> style, String key) {
        Object value = style == null ? null : style.get(key);
        return value instanceof String text && !text.isBlank();
    }

    private boolean hasObject(Map<String, Object> style, String key) {
        Object value = style == null ? null : style.get(key);
        return value instanceof Map<?, ?> map && !map.isEmpty();
    }
}
