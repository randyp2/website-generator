package com.webgen.webgen_backend.portfolio_service.impl;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionRefineRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionRefineResponseDTO;
import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio_service.parser.PortfolioResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.PortfolioPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.prompt.PromptRefinerService;
import lombok.AllArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@AllArgsConstructor
public class PortfolioAiServiceImpl implements PortfolioAiService {

    private final OpenAiChatModel openAiChatModel; // Create ai chat model (generate response)

    private final PromptRefinerService promptRefinerService; // Refine prompts
    private final PortfolioPromptBuilder portfolioPromptBuilder; // Build user prompt

    private final PortfolioResponseParser portfolioResponseParser;



    @Override
    public PortfolioGenerateResponseDTO generatePortfolio(PortfolioGenerateRequestDTO req) {

        // --- Validate and normalize input
        if (req == null || req.getResume() == null) // Require resume for now
            throw new IllegalArgumentException("Resume data required | Req cannot be null");

        // --- Normalize nulls
        ParsedResumeDTO resume = req.getResume();
        if (resume.getSkills() == null) resume.setSkills(List.of());
        if (resume.getExperiences() == null) resume.setExperiences(List.of());
        if (resume.getProjects() == null) resume.setProjects(List.of());
        if (resume.getEducations() == null) resume.setEducations(List.of());
        if (resume.getSummary() == null) resume.setSummary("");

        // --- Refine & Build prompt
        String rawPrompt = req.getUserPrompt();
        String refinedPrompt = promptRefinerService.refineUserPrompt(rawPrompt, resume, req.getStylePrefs());

        Prompt prompt = portfolioPromptBuilder.buildOneShotPrompt(req, refinedPrompt);

        // --- Call AI chat model
        ChatResponse response = openAiChatModel.call(prompt);
        String rawJson = response.getResult().getOutput().getText();

        // --- Parse json and validate
        PortfolioGenerateResponseDTO parsedResponse = portfolioResponseParser.parseGenerateResponse(rawJson);
        portfolioResponseParser.validateGenerateResponse(parsedResponse);

        return parsedResponse;
    }

    @Override
    public SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req) {
        return null;
    }



}
