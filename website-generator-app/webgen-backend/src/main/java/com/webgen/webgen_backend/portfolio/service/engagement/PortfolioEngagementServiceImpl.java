package com.webgen.webgen_backend.portfolio.service.engagement;

import com.webgen.webgen_backend.portfolio.dto.engagement.CreatePortfolioCommentRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioCommentDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioCommentListResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioEngagementSummaryDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.UpdatePortfolioCommentRequestDTO;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioComment;
import com.webgen.webgen_backend.portfolio.entity.PortfolioEngagementCounter;
import com.webgen.webgen_backend.portfolio.repository.PortfolioCommentLikeRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioCommentRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioEngagementCounterRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioLikeRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioEngagementServiceImpl implements PortfolioEngagementService {

    private static final String PUBLISHED_STATUS = "publish";
    private static final String COMMENT_VISIBLE = "visible";
    private static final String COMMENT_HIDDEN = "hidden";
    private static final String COMMENT_DELETED = "deleted";
    private static final int MAX_COMMENT_LENGTH = 2000;
    private static final int DEFAULT_COMMENT_PAGE_SIZE = 100;

    private final PortfolioRepository portfolioRepository;
    private final ProfileRepository profileRepository;
    private final PortfolioEngagementCounterRepository counterRepository;
    private final PortfolioLikeRepository portfolioLikeRepository;
    private final PortfolioCommentRepository commentRepository;
    private final PortfolioCommentLikeRepository commentLikeRepository;

    @Override
    @Transactional(readOnly = true)
    public PortfolioEngagementSummaryDTO getSummaryBySlug(String slug, UUID viewerId) {
        Portfolio portfolio = findPublishedPortfolioBySlug(slug);
        return toSummary(portfolio, viewerId);
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioCommentListResponseDTO listCommentsBySlug(String slug, UUID viewerId) {
        Portfolio portfolio = findPublishedPortfolioBySlug(slug);
        List<PortfolioCommentDTO> comments = commentRepository
                .findByPortfolio_IdAndParentCommentIsNullAndStatusOrderByCreatedAtAsc(
                        portfolio.getId(),
                        COMMENT_VISIBLE,
                        PageRequest.of(0, DEFAULT_COMMENT_PAGE_SIZE))
                .stream()
                .map(comment -> toCommentDtoWithReplies(comment, viewerId))
                .toList();

        return PortfolioCommentListResponseDTO.builder()
                .comments(comments)
                .build();
    }

    @Override
    @Transactional
    public PortfolioEngagementSummaryDTO likePortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = findPublishedPortfolio(portfolioId);
        findProfile(userId);
        portfolioLikeRepository.insertIgnore(UUID.randomUUID(), portfolioId, userId);
        return toSummary(portfolio, userId);
    }

    @Override
    @Transactional
    public PortfolioEngagementSummaryDTO unlikePortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = findPublishedPortfolio(portfolioId);
        portfolioLikeRepository.findByPortfolio_IdAndProfile_Id(portfolioId, userId)
                .ifPresent(portfolioLikeRepository::delete);
        return toSummary(portfolio, userId);
    }

    @Override
    @Transactional
    public PortfolioCommentDTO createComment(
            UUID userId,
            UUID portfolioId,
            CreatePortfolioCommentRequestDTO request) {
        Portfolio portfolio = findPublishedPortfolio(portfolioId);
        Profile profile = findProfile(userId);
        String body = normalizeBody(request.getBody());

        PortfolioComment parent = null;
        if (request.getParentCommentId() != null) {
            parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
            if (!parent.getPortfolio().getId().equals(portfolioId)
                    || parent.getParentComment() != null
                    || !COMMENT_VISIBLE.equals(parent.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid parent comment");
            }
        }

        OffsetDateTime now = OffsetDateTime.now();
        PortfolioComment comment = PortfolioComment.builder()
                .id(UUID.randomUUID())
                .portfolio(portfolio)
                .profile(profile)
                .parentComment(parent)
                .body(body)
                .status(COMMENT_VISIBLE)
                .likesCount(0)
                .repliesCount(0)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toCommentDto(commentRepository.save(comment), userId, List.of());
    }

    @Override
    @Transactional
    public PortfolioCommentDTO updateComment(
            UUID userId,
            UUID commentId,
            UpdatePortfolioCommentRequestDTO request) {
        PortfolioComment comment = findComment(commentId);

        if (request.getBody() != null) {
            verifyCommentAuthor(userId, comment);
            comment.setBody(normalizeBody(request.getBody()));
        }

        if (request.getStatus() != null) {
            verifyCanModerate(userId, comment);
            comment.setStatus(normalizeStatus(request.getStatus()));
        }

        return toCommentDtoWithReplies(commentRepository.save(comment), userId);
    }

    @Override
    @Transactional
    public void deleteComment(UUID userId, UUID commentId) {
        PortfolioComment comment = findComment(commentId);
        verifyCanModerate(userId, comment);
        comment.setStatus(COMMENT_DELETED);
        comment.setDeletedAt(OffsetDateTime.now());
        commentRepository.save(comment);
    }

    @Override
    @Transactional
    public PortfolioCommentDTO likeComment(UUID userId, UUID commentId) {
        PortfolioComment comment = findVisibleComment(commentId);
        findProfile(userId);
        commentLikeRepository.insertIgnore(UUID.randomUUID(), commentId, userId);
        return toCommentDtoWithReplies(findComment(commentId), userId);
    }

    @Override
    @Transactional
    public PortfolioCommentDTO unlikeComment(UUID userId, UUID commentId) {
        PortfolioComment comment = findVisibleComment(commentId);
        commentLikeRepository.findByComment_IdAndProfile_Id(commentId, userId)
                .ifPresent(commentLikeRepository::delete);
        return toCommentDtoWithReplies(comment, userId);
    }

    @Override
    @Transactional
    public PortfolioEngagementSummaryDTO recordView(String slug) {
        Portfolio portfolio = findPublishedPortfolioBySlug(slug);
        ensureCounter(portfolio);
        counterRepository.incrementViewsCount(portfolio.getId());
        return toSummary(portfolio, null);
    }

    @Override
    @Transactional
    public PortfolioEngagementSummaryDTO recordShare(String slug) {
        Portfolio portfolio = findPublishedPortfolioBySlug(slug);
        ensureCounter(portfolio);
        counterRepository.incrementSharesCount(portfolio.getId());
        return toSummary(portfolio, null);
    }

    private Portfolio findPublishedPortfolioBySlug(String slug) {
        return portfolioRepository.findBySlugAndStatus(slug, PUBLISHED_STATUS)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
    }

    private Portfolio findPublishedPortfolio(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!PUBLISHED_STATUS.equals(portfolio.getStatus()) || portfolio.getSlug() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found");
        }
        return portfolio;
    }

    private Profile findProfile(UUID userId) {
        return profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private PortfolioComment findComment(UUID commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    private PortfolioComment findVisibleComment(UUID commentId) {
        PortfolioComment comment = findComment(commentId);
        if (!COMMENT_VISIBLE.equals(comment.getStatus())
                || !PUBLISHED_STATUS.equals(comment.getPortfolio().getStatus())
                || comment.getPortfolio().getSlug() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        return comment;
    }

    private void verifyCommentAuthor(UUID userId, PortfolioComment comment) {
        if (!comment.getProfile().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void verifyCanModerate(UUID userId, PortfolioComment comment) {
        boolean isAuthor = comment.getProfile().getId().equals(userId);
        boolean isPortfolioOwner = comment.getPortfolio().getUserId().equals(userId);
        if (!isAuthor && !isPortfolioOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private String normalizeBody(String value) {
        String body = value == null ? "" : value.trim();
        if (body.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body is required");
        }
        if (body.length() > MAX_COMMENT_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body is too long");
        }
        return body;
    }

    private String normalizeStatus(String value) {
        String status = value.trim().toLowerCase();
        if (!COMMENT_VISIBLE.equals(status) && !COMMENT_HIDDEN.equals(status) && !COMMENT_DELETED.equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid comment status");
        }
        return status;
    }

    private PortfolioEngagementCounter ensureCounter(Portfolio portfolio) {
        return counterRepository.findById(portfolio.getId()).orElseGet(() ->
                counterRepository.save(PortfolioEngagementCounter.builder()
                        .portfolio(portfolio)
                        .portfolioId(portfolio.getId())
                        .likesCount(0)
                        .commentsCount(0)
                        .viewsCount(0)
                        .sharesCount(0)
                        .updatedAt(OffsetDateTime.now())
                        .build()));
    }

    private PortfolioEngagementSummaryDTO toSummary(Portfolio portfolio, UUID viewerId) {
        PortfolioEngagementCounter counter = counterRepository.findById(portfolio.getId()).orElse(null);
        return PortfolioEngagementSummaryDTO.builder()
                .portfolioId(portfolio.getId())
                .likesCount(counter == null ? 0 : counter.getLikesCount())
                .commentsCount(counter == null ? 0 : counter.getCommentsCount())
                .viewsCount(counter == null ? 0 : counter.getViewsCount())
                .sharesCount(counter == null ? 0 : counter.getSharesCount())
                .viewerHasLiked(viewerId != null
                        && portfolioLikeRepository.existsByPortfolio_IdAndProfile_Id(portfolio.getId(), viewerId))
                .build();
    }

    private PortfolioCommentDTO toCommentDtoWithReplies(PortfolioComment comment, UUID viewerId) {
        List<PortfolioCommentDTO> replies = commentRepository
                .findByParentComment_IdAndStatusOrderByCreatedAtAsc(comment.getId(), COMMENT_VISIBLE)
                .stream()
                .map(reply -> toCommentDto(reply, viewerId, List.of()))
                .toList();
        return toCommentDto(comment, viewerId, replies);
    }

    private PortfolioCommentDTO toCommentDto(
            PortfolioComment comment,
            UUID viewerId,
            List<PortfolioCommentDTO> replies) {
        Profile author = comment.getProfile();
        return PortfolioCommentDTO.builder()
                .id(comment.getId())
                .portfolioId(comment.getPortfolio().getId())
                .parentCommentId(comment.getParentComment() == null ? null : comment.getParentComment().getId())
                .authorId(author.getId())
                .authorName(author.getFullName())
                .authorUsername(author.getUsername())
                .authorAvatarUrl(author.getAvatarUrl())
                .body(comment.getBody())
                .status(comment.getStatus())
                .likesCount(comment.getLikesCount())
                .repliesCount(comment.getRepliesCount())
                .viewerHasLiked(viewerId != null
                        && commentLikeRepository.existsByComment_IdAndProfile_Id(comment.getId(), viewerId))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .replies(replies)
                .build();
    }
}
