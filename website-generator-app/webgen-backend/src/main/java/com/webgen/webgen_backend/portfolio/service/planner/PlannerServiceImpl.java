package com.webgen.webgen_backend.portfolio.service.planner;

import com.webgen.webgen_backend.portfolio.dto.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanInputDTO;
import com.webgen.webgen_backend.portfolio.mapper.PortfolioSectionMapper;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.portfolio.service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio.service.parser.PlannerResponseParser;
import com.webgen.webgen_backend.portfolio.service.planner.PlannerService;
import com.webgen.webgen_backend.portfolio.service.prompt.PlannerPromptBuilder;
import com.webgen.webgen_backend.portfolio.exception.RefineSessionExpiredException;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlannerServiceImpl implements PlannerService {
    @Resource(name = "plannerModel")
    private OpenAiChatModel openAiChatModel;

    private final ClarifierService clarifierService;
    private final PlannerPromptBuilder plannerPromptBuilder;
    private final PlannerResponseParser plannerResponseParser;
    private final SectionPlanScopeGuard sectionPlanScopeGuard;
    private final PortfolioSectionRepository sectionRepository;
    private final PortfolioSectionMapper sectionMapper;

    @Override
    public PlannerResponseDTO plan(PlannerRequestDTO req) {
        System.out.println(">>> [PLANNER] plan() started");
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");
        System.out.println(">>> [PLANNER] Input validation passed");
        System.out.println(">>> [PLANNER] Portfolio ID: " + req.getPortfolioId());
        System.out.println(">>> [PLANNER] Assets count: " + (req.getAssets() == null ? 0 : req.getAssets().size()));

        // --- Plan against the DB, not the browser: a stale client snapshot
        // would produce plans for content that no longer exists
        List<SectionPlanInputDTO> sections = sectionMapper.toSectionPlanInputList(
                sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(req.getPortfolioId()));
        System.out.println(">>> [PLANNER] Loaded " + sections.size() + " sections from DB");

        // Get context from clarifier via sessionId
        if (req.getSessionId() == null || req.getSessionId().isBlank())
            throw new IllegalArgumentException("sessionId required!");
        System.out.println(">>> [PLANNER] Loading clarifier context for session: " + req.getSessionId());
        ClarifierContext context = clarifierService.getContext(req.getSessionId());
        if (context == null)
            throw new RefineSessionExpiredException();
        System.out.println(">>> [PLANNER] Context loaded with turnCount=" + context.getTurnCount()
                + ", confidence=" + context.getConfidenceScore()
                + ", scope=" + context.getScope()
                + ", targetSections=" + (context.getTargetSectionKeys() == null ? 0 : context.getTargetSectionKeys().size()));

        // Build prompt
        System.out.println(">>> [PLANNER] Building prompt...");
        long promptStart = System.currentTimeMillis();
        Prompt prompt = plannerPromptBuilder.buildPrompt(context, sections, req.getAssets());
        System.out.println(">>> [PLANNER] Prompt built in " + (System.currentTimeMillis() - promptStart) + "ms");

        // Call model
        System.out.println(">>> [PLANNER] Calling OpenAI model...");
        long aiStart = System.currentTimeMillis();
        ChatResponse response = openAiChatModel.call(prompt);
        System.out.println(">>> [PLANNER] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");
        String rawJson = response.getResult().getOutput().getText();
        System.out.println(">>> [PLANNER] Raw response length: " + (rawJson == null ? 0 : rawJson.length()) + " chars");

        // Parse response
        System.out.println(">>> [PLANNER] Parsing response...");
        long parseStart = System.currentTimeMillis();
        PlannerResponseDTO parsed = plannerResponseParser.parse(rawJson);
        System.out.println(">>> [PLANNER] Parse completed in " + (System.currentTimeMillis() - parseStart) + "ms");

        // --- Enforce the clarified scope BEFORE the user sees the plan, so the
        // approval screen shows exactly what the builder will execute
        parsed.setSectionPlans(sectionPlanScopeGuard.filterToScope(context, parsed.getSectionPlans()));

        // Debug output
        System.out.println("=== PLANNER RESPONSE ===");
        System.out.println("Portfolio ID: " + req.getPortfolioId());
        System.out.println("Plan Summary: " + parsed.getPlanSummary());
        System.out.println("Section Plans: " + parsed.getSectionPlans().size());
        parsed.getSectionPlans().forEach(p ->
                System.out.println("  - " + p.getSectionKey() + ": " + p.getAction())
        );
        System.out.println("========================");
        System.out.println(">>> [PLANNER] Returning planner response");

        return parsed;
    }
}
