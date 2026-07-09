package com.webgen.webgen_backend.portfolio.dto.planner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A section's full content (code + data) as consumed by the refine pipeline. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionContentDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private String reactSource;
    private Object contentJson;
}
