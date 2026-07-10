package com.webgen.webgen_backend.portfolio.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Planned section change shown in refine chat before build approval.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefineChatSectionPlan {
    private String sectionKey;
    private String action;
    private String instruction;
    private String rationale;
    private String intensity;
    private List<String> preserveElements;
    private String newSectionTitle;
    private String insertAfterSectionKey;
    private Integer orderIndex;
}
