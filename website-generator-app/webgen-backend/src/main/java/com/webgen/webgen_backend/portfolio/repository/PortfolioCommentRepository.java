package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PortfolioCommentRepository extends JpaRepository<PortfolioComment, UUID> {
    Page<PortfolioComment> findByPortfolio_IdAndParentCommentIsNullAndStatusOrderByCreatedAtAsc(
            UUID portfolioId,
            String status,
            Pageable pageable
    );

    List<PortfolioComment> findByParentComment_IdAndStatusOrderByCreatedAtAsc(
            UUID parentCommentId,
            String status
    );

    long countByPortfolio_IdAndStatus(UUID portfolioId, String status);
}
