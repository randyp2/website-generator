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
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlannerServiceImpl implements PlannerService {
    @Resource(name = "portfolioBlueprintModel")
    private ChatModel blueprintModel;

    private final ClarifierService clarifierService;
    private final PlannerPromptBuilder plannerPromptBuilder;
    private final PlannerResponseParser plannerResponseParser;
    private final SectionPlanScopeGuard sectionPlanScopeGuard;
    private final PortfolioSectionRepository sectionRepository;
    private final PortfolioSectionMapper sectionMapper;

    @Override
    public PlannerResponseDTO plan(PlannerRequestDTO req) {
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");

        // --- Plan against the DB, not the browser: a stale client snapshot
        // would produce plans for content that no longer exists
        List<SectionPlanInputDTO> sections = sectionMapper.toSectionPlanInputList(
                sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(req.getPortfolioId()));

        // Get context from clarifier via sessionId
        if (req.getSessionId() == null || req.getSessionId().isBlank())
            throw new IllegalArgumentException("sessionId required!");
        ClarifierContext context = clarifierService.getContext(req.getSessionId());
        if (context == null)
            throw new RefineSessionExpiredException();
        log.debug("Planner context loaded sessionId={} turnCount={} confidence={} scope={} targetSections={}",
                req.getSessionId(), context.getTurnCount(), context.getConfidenceScore(), context.getScope(),
                context.getTargetSectionKeys() == null ? 0 : context.getTargetSectionKeys().size());

        Prompt prompt = plannerPromptBuilder.buildPrompt(context, sections, req.getAssets());

        long aiStart = System.currentTimeMillis();
        ChatResponse response = blueprintModel.call(prompt);
        log.debug("Planner model call completed portfolioId={} durationMs={}",
                req.getPortfolioId(), System.currentTimeMillis() - aiStart);
        String rawJson = response.getResult().getOutput().getText();

        PlannerResponseDTO parsed = plannerResponseParser.parse(rawJson);

        // --- Enforce the clarified scope BEFORE the user sees the plan, so the
        // approval screen shows exactly what the builder will execute
        parsed.setSectionPlans(sectionPlanScopeGuard.filterToScope(context, parsed.getSectionPlans()));

        log.info("Plan generated portfolioId={} sectionPlanCount={}",
                req.getPortfolioId(), parsed.getSectionPlans().size());
        return parsed;
    }
}
