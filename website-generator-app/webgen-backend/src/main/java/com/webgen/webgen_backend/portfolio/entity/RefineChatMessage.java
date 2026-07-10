package com.webgen.webgen_backend.portfolio.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Persisted refine chat message for a portfolio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefineChatMessage {
    private String id;
    private String role;
    private String content;
    private String timestamp;
    private Boolean isGenerating;
    private String messageType;
    private Boolean readyForPlanning;
    private List<RefineChatSectionPlan> sectionPlans;
    private String planSummary;
}
