package com.webgen.webgen_backend.dto.portfolio;


import lombok.Data;

import java.util.List;

@Data
public class CompletedSectionsResponseDTO {
        private List<SectionDTO> sections;
        private JobStatusDTO.Status status;
        private int completedCount;
        private int totalSections;
}
