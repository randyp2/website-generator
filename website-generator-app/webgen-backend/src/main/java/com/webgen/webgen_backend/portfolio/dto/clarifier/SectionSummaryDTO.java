package com.webgen.webgen_backend.portfolio.dto.clarifier;

import lombok.Data;

@Data
public class SectionSummaryDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private String summary;
}
