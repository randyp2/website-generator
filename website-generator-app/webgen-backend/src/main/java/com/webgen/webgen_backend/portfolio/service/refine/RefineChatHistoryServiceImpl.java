package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefineChatHistoryServiceImpl implements RefineChatHistoryService {
    private final PortfolioRepository portfolioRepository;
    private final RefineChatHistoryPolicy historyPolicy;

    @Override
    @Transactional(readOnly = true)
    public List<RefineChatMessage> loadHistory(UUID userId, UUID portfolioId) {
        Portfolio portfolio = getOwnedPortfolio(userId, portfolioId);
        return historyPolicy.normalize(portfolio.getRefineChatHistory());
    }

    @Override
    @Transactional
    public List<RefineChatMessage> saveHistory(
            UUID userId,
            UUID portfolioId,
            List<RefineChatMessage> history
    ) {
        Portfolio portfolio = getOwnedPortfolio(userId, portfolioId);
        List<RefineChatMessage> normalizedHistory = historyPolicy.normalize(history);
        portfolio.setRefineChatHistory(normalizedHistory);

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        return historyPolicy.normalize(savedPortfolio.getRefineChatHistory());
    }

    private Portfolio getOwnedPortfolio(UUID userId, UUID portfolioId) {
        if (userId == null || portfolioId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and portfolioId are required");
        }

        return portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
    }
}
