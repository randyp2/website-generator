package com.webgen.webgen_backend.portfolio.service.fallback;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.BlueprintSectionPlanDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.util.SectionNames;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Builds minimal, guaranteed-renderable placeholder sections.
 *
 * Used when every generation attempt for a section fails validation: instead
 * of failing the whole job (and losing every other valid section), the worker
 * ships this placeholder so the portfolio completes and the user can
 * regenerate the single degraded section from the editor.
 */
@Service
@RequiredArgsConstructor
public class FallbackSectionFactory {

    private final ObjectMapper objectMapper;

    /**
     * Creates a placeholder section honoring the invariants locked on the first
     * generation attempt, falling back to the blueprint plan when no attempt
     * produced a parseable result.
     *
     * @param plan              blueprint plan item for the failed section
     * @param lockedTitle       title locked from attempt 1, or null
     * @param lockedOrderIndex  orderIndex locked from attempt 1, or null
     * @param lockedContentJson contentJson locked from attempt 1, or null
     * @return section DTO whose reactSource satisfies the full section contract
     */
    public SectionDTO createFallbackSection(
            BlueprintSectionPlanDTO plan,
            String lockedTitle,
            Integer lockedOrderIndex,
            JsonNode lockedContentJson) {

        String sectionKey = plan.getSectionKey();
        String title = firstNonBlank(lockedTitle, plan.getTitle(), SectionNames.toPascalCase(sectionKey));
        Integer orderIndex = lockedOrderIndex != null ? lockedOrderIndex : plan.getOrderIndex();
        JsonNode contentJson = lockedContentJson != null ? lockedContentJson : objectMapper.createObjectNode();

        SectionDTO section = new SectionDTO();
        section.setSectionKey(sectionKey);
        section.setTitle(title);
        section.setOrderIndex(orderIndex);
        section.setContentJson(contentJson);
        section.setReactSource(buildFallbackReactSource(sectionKey, title));
        return section;
    }

    /*
     * The generated source must satisfy every rule the validator enforces:
     * default export named <PascalCase>Section, a destructured { data } param,
     * a top-level element with id equal to the sectionKey, a transparent
     * background, and no code comments.
     */
    private String buildFallbackReactSource(String sectionKey, String title) {
        String componentName = SectionNames.toPascalCase(sectionKey) + "Section";
        String safeTitle = sanitizeForJsxText(title);

        return """
                export default function %s({ data }) {
                    return (
                        <section id="%s" className="bg-transparent px-6 py-20">
                            <div className="mx-auto max-w-3xl text-center">
                                <h2 className="text-2xl font-semibold opacity-80">%s</h2>
                                <p className="mt-3 text-sm opacity-50">
                                    This section could not be generated automatically. Regenerate it from the editor to fill it in.
                                </p>
                            </div>
                        </section>
                    );
                }
                """.formatted(componentName, sectionKey, safeTitle);
    }

    /* Strips characters that would break out of a JSX text position. */
    private String sanitizeForJsxText(String text) {
        if (text == null || text.isBlank())
            return "Section";
        return text.replaceAll("[{}<>]", "").trim();
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank())
                return candidate;
        }
        return "Section";
    }
}
