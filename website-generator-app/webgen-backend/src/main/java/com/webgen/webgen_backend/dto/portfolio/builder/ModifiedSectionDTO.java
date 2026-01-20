package com.webgen.webgen_backend.dto.portfolio.builder;

import lombok.Data;

@Data
public class ModifiedSectionDTO {
    private String sectionKey;
    private String title;
    private String reactSource;
    private Object contentJson;
    private String changeDescription;
}
