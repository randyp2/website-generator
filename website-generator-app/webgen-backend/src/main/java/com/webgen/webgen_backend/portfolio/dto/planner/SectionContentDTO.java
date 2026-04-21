package com.webgen.webgen_backend.portfolio.dto.planner;

import lombok.Data;

@Data
public class SectionContentDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private String reactSource;
    private Object contentJson;
}
