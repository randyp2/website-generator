package com.webgen.webgen_backend.portfolio.service.prompt;

import com.webgen.webgen_backend.portfolio.dto.BlueprintDTO;
import com.webgen.webgen_backend.portfolio.dto.BlueprintSectionPlanDTO;
import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Renders every portfolio prompt template with representative values, so a
 * template referencing a placeholder the builder does not supply fails here
 * instead of at generation time.
 */
class PortfolioPromptBuilderTest {

    private final PortfolioPromptBuilder builder = new PortfolioPromptBuilder();

    private PortfolioGenerateRequestDTO request() {
        ParsedResumeDTO resume = new ParsedResumeDTO();
        resume.setFullName("Jane Doe");
        resume.setSummary("Engineer");
        resume.setEmail("jane@example.com");
        resume.setSkills(List.of("Java", "React"));

        PortfolioGenerateRequestDTO req = new PortfolioGenerateRequestDTO();
        req.setResume(resume);
        req.setTemplateId("one-shot");
        req.setStylePrefs(Map.of("tone", "playful", "customNotes", "comic accents"));
        return req;
    }

    private BlueprintSectionPlanDTO planItem() {
        BlueprintSectionPlanDTO plan = new BlueprintSectionPlanDTO();
        plan.setSectionKey("work-experience");
        plan.setTitle("Journey");
        plan.setOrderIndex(2);
        plan.setLayoutHint("timeline with alternating sides");
        plan.setContentStrategy("emphasize impact");
        return plan;
    }

    private void assertFullyRendered(Prompt prompt) {
        // System templates may contain literal JSX braces; only the user message
        // must be free of unresolved {{placeholder}} tokens.
        String userText = prompt.getInstructions().get(1).getText();
        assertFalse(userText.matches("(?s).*\\{\\{[a-zA-Z0-9_]+}}.*"),
                "user message contains unresolved placeholders:\n" + userText);
    }

    @Test
    void oneShotPromptRenders() {
        Prompt prompt = builder.buildOneShotPrompt(request(), "make it playful");
        assertFullyRendered(prompt);
        assertTrue(prompt.getInstructions().get(1).getText().contains("Jane Doe"));
        assertTrue(prompt.getInstructions().get(1).getText().contains("comic accents"));
    }

    @Test
    void blueprintPromptRenders() {
        Prompt prompt = builder.buildBlueprintPrompt(request(), "make it playful");
        assertFullyRendered(prompt);
        assertTrue(prompt.getInstructions().get(1).getText().contains("Jane Doe"));
    }

    @Test
    void sectionPromptRenders() {
        BlueprintDTO blueprint = new BlueprintDTO();
        blueprint.setDesignDirective("Editorial magazine aesthetic");

        Prompt prompt = builder.buildSectionPrompt(request(), "make it playful", blueprint, planItem());

        assertFullyRendered(prompt);
        String systemText = prompt.getInstructions().get(0).getText();
        assertTrue(systemText.contains("Editorial magazine aesthetic"));
        assertTrue(systemText.contains("`data` IS `contentJson`. Never use `data.contentJson`."));
        assertTrue(prompt.getInstructions().get(1).getText().contains("work-experience"));
        assertTrue(prompt.getInstructions().get(1).getText().contains("timeline with alternating sides"));
    }

    @Test
    void sectionRetryPromptRenders() {
        ValidationResult.ValidationError error = new ValidationResult.ValidationError();
        error.setSectionKey("work-experience");
        error.setMessage("MapPin must be rendered as a JSX element");
        error.setLine(4);

        Prompt prompt = builder.buildSectionRetryPrompt(
                request(), "make it playful", new BlueprintDTO(), planItem(),
                List.of(error), "export default function Broken({ data }) {}", null);

        assertFullyRendered(prompt);
        String systemText = prompt.getInstructions().get(0).getText();
        assertTrue(systemText.contains("MapPin must be rendered as a JSX element"));
        assertTrue(systemText.contains("WorkExperienceSection"),
                "component name must be PascalCase from the sectionKey");
    }
}
