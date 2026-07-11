package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RefineChatHistoryServiceImplTest {
    private RepositoryInvocationHandler repositoryHandler;
    private PortfolioRepository portfolioRepository;
    private RefineChatHistoryServiceImpl service;

    @BeforeEach
    void setUp() {
        repositoryHandler = new RepositoryInvocationHandler();
        portfolioRepository = repositoryHandler.proxy();
        service = new RefineChatHistoryServiceImpl(
                portfolioRepository,
                new RefineChatHistoryPolicy()
        );
    }

    @Test
    void loadHistoryUsesOwnershipScopedLookup() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = portfolio(portfolioId, userId);
        portfolio.setRefineChatHistory(List.of(message("message-1")));
        repositoryHandler.portfolioToReturn = portfolio;

        List<RefineChatMessage> history = service.loadHistory(userId, portfolioId);

        assertEquals(1, history.size());
        assertEquals("message-1", history.getFirst().getId());
        assertEquals(portfolioId, repositoryHandler.lookupPortfolioId);
        assertEquals(userId, repositoryHandler.lookupUserId);
    }

    @Test
    void saveHistoryNormalizesAndPersistsHistory() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = portfolio(portfolioId, userId);
        repositoryHandler.portfolioToReturn = portfolio;

        List<RefineChatMessage> saved = service.saveHistory(
                userId,
                portfolioId,
                List.of(message("message-1"))
        );

        assertEquals(1, saved.size());
        assertEquals("message-1", portfolio.getRefineChatHistory().getFirst().getId());
        assertSame(portfolio, repositoryHandler.savedPortfolio);
    }

    @Test
    void saveHistoryThrowsNotFoundWhenPortfolioIsNotOwnedByUser() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();

        assertThrows(
                ResponseStatusException.class,
                () -> service.saveHistory(userId, portfolioId, new ArrayList<>())
        );
    }

    private Portfolio portfolio(UUID portfolioId, UUID userId) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(portfolioId);
        portfolio.setUserId(userId);
        portfolio.setRefineChatHistory(new ArrayList<>());
        return portfolio;
    }

    private RefineChatMessage message(String id) {
        return new RefineChatMessage(
                id,
                "user",
                "content",
                "2026-07-10T00:00:00.000Z",
                false,
                "clarify",
                false,
                new ArrayList<>(),
                null,
                null
        );
    }

    private static final class RepositoryInvocationHandler implements InvocationHandler {
        private Portfolio portfolioToReturn;
        private Portfolio savedPortfolio;
        private UUID lookupPortfolioId;
        private UUID lookupUserId;

        private PortfolioRepository proxy() {
            return (PortfolioRepository) Proxy.newProxyInstance(
                    PortfolioRepository.class.getClassLoader(),
                    new Class<?>[]{PortfolioRepository.class},
                    this
            );
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            if ("findByIdAndUserId".equals(method.getName())) {
                lookupPortfolioId = (UUID) args[0];
                lookupUserId = (UUID) args[1];
                return Optional.ofNullable(portfolioToReturn);
            }

            if ("save".equals(method.getName())) {
                savedPortfolio = (Portfolio) args[0];
                return savedPortfolio;
            }

            if ("toString".equals(method.getName())) {
                return "RepositoryInvocationHandler";
            }

            throw new UnsupportedOperationException(method.getName());
        }
    }
}
