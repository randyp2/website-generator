package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ChangeIntensity;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierConstraints;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClarifierResponseParser {
    private final ObjectMapper objectMapper;

    private ClarifierContext lastUpdatedContext;

    public ClarifierResponseDTO parse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            ClarifierResponseDTO dto = new ClarifierResponseDTO();
            dto.setAssistantMessage(root.path("assistantMessage").asText());
            dto.setReadyForPlanning(root.path("readyForPlanning").asBoolean(false));
            dto.setClarificationComplete(root.path("clarificationComplete").asBoolean(false));

            JsonNode ctxNode = root.path("updatedContext");
            if (ctxNode.isMissingNode() || !ctxNode.isObject())
                throw new IllegalArgumentException("updated context is missing or invalid");

            this.lastUpdatedContext = parseContext(ctxNode);
            return dto;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse AI Clarifier response JSON", e);
        }
    }

    public ClarifierContext getUpdatedContext() {
        return lastUpdatedContext;
    }

    private ClarifierContext parseContext(JsonNode ctxNode) {
        ClarifierContext ctx = new ClarifierContext();
        ctx.setConfidenceScore(ctxNode.path("confidenceScore").asDouble(0.0));
        ctx.setGlobalIntent(ctxNode.path("globalIntent").asText(""));
        ctx.setScope(ctxNode.path("scope").asText("unknown"));
        ctx.setLastUserMessage(ctxNode.path("lastUserMessage").asText(""));
        ctx.setTurnCount(ctxNode.path("turnCount").asInt(0));

        // Populate sectionIntents
        Map<String, String> sectionIntents = new HashMap<>();
        JsonNode sectionIntentsNode = ctxNode.path("sectionIntents");
        if (sectionIntentsNode.isObject()) {
            ObjectNode obj = (ObjectNode) sectionIntentsNode;
            obj.properties().forEach(entry ->
                    sectionIntents.put(entry.getKey(), entry.getValue().asText(""))
            );
        }
        ctx.setSectionIntents(sectionIntents);

        // Populate properties that are string lists
        ctx.setTargetSectionKeys(readStringList(ctxNode.path("targetSectionKeys")));
        ctx.setOpenQuestions(readStringList(ctxNode.path("openQuestions")));
        ctx.setAssumptions(readStringList(ctxNode.path("assumptions")));

        // Populate constraints
        JsonNode constraintsNode = ctxNode.path("constraints");
        if (constraintsNode.isMissingNode() || !constraintsNode.isObject())
            throw new IllegalArgumentException("constraints is missing or invalid");
        ClarifierConstraints constraints = new ClarifierConstraints();
        constraints.setAvoidCasualTone(constraintsNode.path("avoidCasualTone").asBoolean(false));
        constraints.setReduceTextDensity(constraintsNode.path("reduceTextDensity").asBoolean(false));
        constraints.setPreserveContent(constraintsNode.path("preserveContent").asBoolean(false));
        constraints.setLockedSectionKeys(readStringList(constraintsNode.path("lockedSectionKeys")));

        String intensity = constraintsNode.path("changeIntensity").asText("MEDIUM");
        try {
            constraints.setChangeIntensity(ChangeIntensity.valueOf(intensity));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalide change intensity key: " + intensity);
        }

        ctx.setConstraints(constraints);
        return ctx;
    }

    private List<String> readStringList(JsonNode node) {
        if (!node.isArray()) return new ArrayList<>();
        List<String> list = new ArrayList<>();
        for (JsonNode item : node)
            list.add(item.asText(""));
        return list;
    }
}
