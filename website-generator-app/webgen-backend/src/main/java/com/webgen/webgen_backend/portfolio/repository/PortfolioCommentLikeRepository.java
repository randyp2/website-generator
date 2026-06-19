package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioCommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioCommentLikeRepository
        extends JpaRepository<PortfolioCommentLike, UUID> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            insert into public.portfolio_comment_likes (id, comment_id, profile_id)
            values (:id, :commentId, :profileId)
            on conflict (comment_id, profile_id) do nothing
            """, nativeQuery = true)
    int insertIgnore(UUID id, UUID commentId, UUID profileId);

    boolean existsByComment_IdAndProfile_Id(UUID commentId, UUID profileId);
    Optional<PortfolioCommentLike> findByComment_IdAndProfile_Id(UUID commentId, UUID profileId);
    long countByComment_Id(UUID commentId);
}
