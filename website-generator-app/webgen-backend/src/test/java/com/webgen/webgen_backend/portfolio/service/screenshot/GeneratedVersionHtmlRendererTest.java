package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.service.export.PortfolioHtmlExportService;
import com.webgen.webgen_backend.portfolio.service.version.VersionSnapshotReader;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class GeneratedVersionHtmlRendererTest {

    @Test
    void rendersTheStoredVersionSnapshotAsAStandaloneDocument() {
        ObjectMapper objectMapper = new ObjectMapper();
        GeneratedVersionHtmlRenderer renderer = new GeneratedVersionHtmlRenderer(
                new VersionSnapshotReader(objectMapper),
                new PortfolioHtmlExportService(objectMapper),
                objectMapper
        );
        SectionDTO section = new SectionDTO();
        section.setSectionKey("hero");
        section.setOrderIndex(0);
        section.setContentJson(objectMapper.createObjectNode().put("headline", "Hello"));
        section.setReactSource("export default function Hero({ content }) { return <h1>{content.headline}</h1>; }");

        ObjectNode snapshot = objectMapper.createObjectNode();
        snapshot.set("sections", objectMapper.valueToTree(List.of(section)));
        GeneratedVersion version = new GeneratedVersion();
        version.setId(UUID.randomUUID());
        version.setSectionsSnapshot(snapshot);

        String html = renderer.render(version, "Preview title");

        assertThat(html).contains("<title>Preview title</title>");
        assertThat(html).contains("const Section0 = function");
        assertThat(html).contains("Hello");
    }
}
