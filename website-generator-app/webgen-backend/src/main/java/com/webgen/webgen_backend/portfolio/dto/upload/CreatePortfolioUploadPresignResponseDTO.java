package com.webgen.webgen_backend.portfolio.dto.upload;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/** Contains all signed upload instructions for one portfolio upload batch. */
@Data
@AllArgsConstructor
public class CreatePortfolioUploadPresignResponseDTO {
    private List<PortfolioUploadInstructionDTO> uploads;
}
