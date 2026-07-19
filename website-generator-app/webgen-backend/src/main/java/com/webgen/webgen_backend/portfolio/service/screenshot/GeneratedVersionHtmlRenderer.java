package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.GlobalThemeDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.service.export.PortfolioHtmlExportService;
import com.webgen.webgen_backend.portfolio.service.version.VersionSnapshotReader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GeneratedVersionHtmlRenderer {

    private final VersionSnapshotReader snapshotReader;
    private final PortfolioHtmlExportService htmlExportService;
    private final ObjectMapper objectMapper;

    /** Builds a standalone document from an immutable generated version. */
    public String render(GeneratedVersion version, String title) {
        List<SectionDTO> sections = snapshotReader.readSections(version);
        if (sections.isEmpty()) {
            throw new IllegalStateException("Generated version has no renderable sections: " + version.getId());
        }

        GlobalThemeDTO theme = version.getGlobalTheme() == null
                ? null
                : objectMapper.convertValue(version.getGlobalTheme(), GlobalThemeDTO.class);
        return htmlExportService.generateHtml(sections, theme, title);
    }
}
