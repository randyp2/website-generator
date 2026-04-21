package com.webgen.webgen_backend.portfolio.dto.planner;

import lombok.Data;

@Data
public class SectionPlanInputDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private Object contentJson;
}
