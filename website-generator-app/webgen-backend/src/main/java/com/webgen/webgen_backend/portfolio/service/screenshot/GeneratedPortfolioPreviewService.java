package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.portfolio.dto.crud.PublishRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.screenshot.GeneratedPreviewResponseDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeneratedPortfolioPreviewService {

    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final RabbitTemplate rabbitTemplate;

    /** Queues a screenshot for the owned portfolio's active generated version. */
    public GeneratedPreviewResponseDTO requestPreview(UUID userId, UUID portfolioId) {
        PreviewContext context = loadContext(userId, portfolioId);
        if (StringUtils.hasText(context.version().getPreviewUrl())) {
            return response(context, GeneratedPreviewResponseDTO.Status.READY);
        }

        ScreenshotMessage message = ScreenshotMessage.forGeneratedVersion(
                portfolioId.toString(),
                context.version().getId().toString()
        );
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.SCREENSHOT_ROUTING_KEY,
                message
        );
        log.info(
                "Queued generated portfolio preview screenshot portfolioId={} versionId={} jobId={}",
                portfolioId,
                context.version().getId(),
                message.getJobId()
        );
        return response(context, GeneratedPreviewResponseDTO.Status.QUEUED);
    }

    /** Returns the current active generated version's screenshot state. */
    public GeneratedPreviewResponseDTO getPreview(UUID userId, UUID portfolioId) {
        PreviewContext context = loadContext(userId, portfolioId);
        GeneratedPreviewResponseDTO.Status status = StringUtils.hasText(context.version().getPreviewUrl())
                ? GeneratedPreviewResponseDTO.Status.READY
                : GeneratedPreviewResponseDTO.Status.PENDING;
        return response(context, status);
    }

    private PreviewContext loadContext(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (!PublishRequestDTO.SourceType.GENERATED.name().equals(portfolio.getSourceType())) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Preview screenshots are only available for generated portfolios"
            );
        }
        if (portfolio.getActiveVersionId() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Portfolio has no active version");
        }

        GeneratedVersion version = generatedVersionRepository
                .findByIdAndPortfolio_Id(portfolio.getActiveVersionId(), portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Active version not found"));
        return new PreviewContext(version);
    }

    private GeneratedPreviewResponseDTO response(
            PreviewContext context,
            GeneratedPreviewResponseDTO.Status status
    ) {
        return new GeneratedPreviewResponseDTO(
                context.version().getId(),
                status,
                context.version().getPreviewUrl()
        );
    }

    private record PreviewContext(GeneratedVersion version) {
    }
}
