package com.webgen.webgen_backend.dto.portfolio.planner;

import lombok.Data;

@Data
public class SectionContentDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private String reactSource;
    private Object contentJson;
}
