package com.webgen.webgen_backend.portfolio.service.version;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * Reads section content out of a GeneratedVersion's sections snapshot
 * ({"sections": [...], "globalTheme": ...}, written identically by generation
 * and refinement persistence). Shared by version restore and public rendering
 * so snapshot parsing lives in exactly one place.
 */
@Service
@RequiredArgsConstructor
public class VersionSnapshotReader {

    private final ObjectMapper objectMapper;

    /**
     * Extracts the sections stored in the version snapshot.
     *
     * @param version generated version holding the snapshot
     * @return snapshot sections, or an empty list when the snapshot is absent
     *         or unreadable (callers treat that as "not servable/restorable")
     */
    public List<SectionDTO> readSections(GeneratedVersion version) {
        JsonNode snapshot = version == null ? null : version.getSectionsSnapshot();
        JsonNode sectionsNode = snapshot == null ? null : snapshot.get("sections");
        if (sectionsNode == null || !sectionsNode.isArray() || sectionsNode.isEmpty())
            return List.of();

        try {
            return objectMapper.readerForListOf(SectionDTO.class).readValue(sectionsNode);
        } catch (IOException e) {
            return List.of();
        }
    }
}
