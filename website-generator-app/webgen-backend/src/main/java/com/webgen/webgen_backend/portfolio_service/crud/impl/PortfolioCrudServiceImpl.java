package com.webgen.webgen_backend.portfolio_service.crud.impl;

import com.webgen.webgen_backend.dto.portfolio.crud.CreatePortfolioRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioListDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.UpdatePortfolioRequestDTO;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.mapper.PortfolioMapper;
import com.webgen.webgen_backend.portfolio_service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioCrudServiceImpl implements PortfolioCrudService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioMapper portfolioMapper;

    @Override
    public PortfolioListDTO listPortfolios(UUID userId) {
        List<PortfolioDTO> portfolios = portfolioRepository.findByUserId(userId)
                .stream()
                .map(portfolioMapper :: toDto)
                .toList();

        PortfolioListDTO response = new PortfolioListDTO();
        response.setPortfolios(portfolios);

        return response;
    }

    @Override
    public PortfolioDTO createDraft(UUID userId, CreatePortfolioRequestDTO request) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(UUID.randomUUID());
        portfolio.setUserId(userId);
        portfolio.setTitle("Untitled Portfolio");
        portfolio.setTemplateId(request.getTemplateId());
        portfolio.setStatus("draft");
        portfolio.setLastStep("style");
        portfolio.setStyleChatHistory(new ArrayList<>());

        Portfolio saved = portfolioRepository.save(portfolio);
        return portfolioMapper.toDto(saved);
    }

    @Override
    public PortfolioDTO updatePortfolio(UUID userId, UUID portfolioId, UpdatePortfolioRequestDTO request) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");


        if (request.getTitle() != null) portfolio.setTitle(request.getTitle());
        if (request.getLastStep() != null) portfolio.setLastStep(request.getLastStep());
        if (request.getTemplateId() != null) portfolio.setTemplateId(request.getTemplateId());
        if (request.getStyleChatHistory() != null) portfolio.setStyleChatHistory(request.getStyleChatHistory());

        Portfolio saved = portfolioRepository.save(portfolio);
        return portfolioMapper.toDto(saved);
    }

    @Override
    public void deletePortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        portfolioRepository.deleteById(portfolioId);
    }
}
