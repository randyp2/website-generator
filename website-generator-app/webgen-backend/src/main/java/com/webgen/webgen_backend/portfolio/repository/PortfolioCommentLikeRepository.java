package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioCommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioCommentLikeRepository
        extends JpaRepository<PortfolioCommentLike, UUID> {
    boolean existsByComment_IdAndProfile_Id(UUID commentId, UUID profileId);
    Optional<PortfolioCommentLike> findByComment_IdAndProfile_Id(UUID commentId, UUID profileId);
    long countByComment_Id(UUID commentId);
}
