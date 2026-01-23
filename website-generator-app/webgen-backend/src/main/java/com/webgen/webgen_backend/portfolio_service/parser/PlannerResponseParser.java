package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionPlanDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ChangeIntensity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlannerResponseParser {
    private final ObjectMapper objectMapper;

    public PlannerResponseDTO parse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            PlannerResponseDTO dto = new PlannerResponseDTO();
            dto.setPlanSummary(root.path("planSummary").asText(""));
            dto.setPlanApproved(false); // Default, user approval happens later

            List<SectionPlanDTO> plans = new ArrayList<>();
            JsonNode plansNode = root.path("sectionPlans");
            if (plansNode.isArray()) {
                for (JsonNode planNode : plansNode) {
                    plans.add(parseSectionPlan(planNode));
                }
            }
            dto.setSectionPlans(plans);

            return dto;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse Planner response JSON", e);
        }
    }

    private SectionPlanDTO parseSectionPlan(JsonNode node) {
        SectionPlanDTO plan = new SectionPlanDTO();
        plan.setSectionKey(node.path("sectionKey").asText(""));
        plan.setAction(node.path("action").asText("keep"));
        plan.setInstruction(node.path("instruction").asText(""));
        plan.setRationale(node.path("rationale").asText(""));
        plan.setPreserveElements(readStringList(node.path("preserveElements")));
        plan.setNewSectionTitle(node.path("newSectionTitle").asText(""));
        plan.setInsertAfterSectionKey(node.path("insertAfterSectionKey").asText(""));
        plan.setOrderIndex(node.path("orderIndex").isNumber()
                ? node.path("orderIndex").asInt()
                : null);

        String intensity = node.path("intensity").asText("MEDIUM");
        try {
            plan.setIntensity(ChangeIntensity.valueOf(intensity));
        } catch (IllegalArgumentException e) {
            plan.setIntensity(ChangeIntensity.MEDIUM);
        }

        return plan;
    }

    private List<String> readStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                list.add(item.asText(""));
            }
        }
        return list;
    }
}
