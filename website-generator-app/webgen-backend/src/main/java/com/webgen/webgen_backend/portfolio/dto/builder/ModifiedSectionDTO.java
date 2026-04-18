package com.webgen.webgen_backend.portfolio.dto.builder;

import lombok.Data;

@Data
public class ModifiedSectionDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private String reactSource;
    private Object contentJson;
    private String changeDescription;
}
