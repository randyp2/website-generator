package com.webgen.webgen_backend.portfolio.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.SectionRefineRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.SectionRefineResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio.service.builder.BuilderService;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GenerationWorkerTest {

    @Test
    void generationFailureRefundsReservationAndNacksMessage() throws IOException {
        UUID reservationId = UUID.randomUUID();
        StubJobService jobService = new StubJobService();
        StubPortfolioAiService portfolioAiService = new StubPortfolioAiService(true);
        StubCreditGuardService creditGuardService = new StubCreditGuardService();
        ChannelState channelState = new ChannelState(false);
        GenerationWorker worker = new GenerationWorker(
                jobService,
                portfolioAiService,
                new StubBuilderService(false),
                creditGuardService
        );

        worker.handleGeneration(
                generationMessage(reservationId),
                channel(channelState),
                12L
        );

        assertThat(portfolioAiService.receivedReservationId).isEqualTo(reservationId);
        assertThat(jobService.failureReason).isEqualTo("upstream failed");
        assertThat(creditGuardService.refundedReservationId).isEqualTo(reservationId);
        assertThat(creditGuardService.failureReason).isEqualTo("IllegalStateException");
        assertThat(channelState.invocations).containsExactly("nack:12");
    }

    @Test
    void acknowledgementFailureDoesNotRefundCompletedGeneration() {
        UUID reservationId = UUID.randomUUID();
        StubJobService jobService = new StubJobService();
        StubCreditGuardService creditGuardService = new StubCreditGuardService();
        ChannelState channelState = new ChannelState(true);
        GenerationWorker worker = new GenerationWorker(
                jobService,
                new StubPortfolioAiService(false),
                new StubBuilderService(false),
                creditGuardService
        );

        assertThatThrownBy(() -> worker.handleGeneration(
                generationMessage(reservationId),
                channel(channelState),
                23L
        )).isInstanceOf(IOException.class).hasMessage("ack failed");

        assertThat(jobService.failureReason).isNull();
        assertThat(creditGuardService.refundedReservationId).isNull();
        assertThat(channelState.invocations).containsExactly("ack:23");
    }

    @Test
    void refineSectionFailureRefundsSharedReservationAndNacksMessage() throws IOException {
        UUID reservationId = UUID.randomUUID();
        StubJobService jobService = new StubJobService();
        StubCreditGuardService creditGuardService = new StubCreditGuardService();
        ChannelState channelState = new ChannelState(false);
        GenerationWorker worker = new GenerationWorker(
                jobService,
                new StubPortfolioAiService(false),
                new StubBuilderService(true),
                creditGuardService
        );
        SectionPlanDTO plan = new SectionPlanDTO();
        plan.setSectionKey("hero");
        SectionGenerationMessage message = new SectionGenerationMessage();
        message.setJobId("job-2");
        message.setMode(SectionGenerationMessage.Mode.REFINE);
        message.setRefinePlan(plan);
        message.setCreditReservationId(reservationId);

        worker.handleSection(message, channel(channelState), 34L);

        assertThat(jobService.failureReason).isEqualTo("section failed");
        assertThat(creditGuardService.refundedReservationId).isEqualTo(reservationId);
        assertThat(creditGuardService.failureReason).isEqualTo("IllegalStateException");
        assertThat(channelState.invocations).containsExactly("nack:34");
    }

    private PortfolioGenerationMessage generationMessage(UUID reservationId) {
        return PortfolioGenerationMessage.builder()
                .jobId("job-1")
                .portfolioId(UUID.randomUUID().toString())
                .userId(UUID.randomUUID().toString())
                .creditReservationId(reservationId)
                .req(new PortfolioGenerateRequestDTO())
                .build();
    }

    private Channel channel(ChannelState state) {
        return (Channel) Proxy.newProxyInstance(
                Channel.class.getClassLoader(),
                new Class[]{Channel.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "basicAck" -> {
                        state.invocations.add("ack:" + args[0]);
                        if (state.failAck) {
                            throw new IOException("ack failed");
                        }
                        yield null;
                    }
                    case "basicNack" -> {
                        state.invocations.add("nack:" + args[0]);
                        yield null;
                    }
                    case "toString" -> "channel-proxy";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            "Unexpected channel method invocation: " + method.getName()
                    );
                }
        );
    }

    private static final class ChannelState {
        private final boolean failAck;
        private final List<String> invocations = new ArrayList<>();

        private ChannelState(boolean failAck) {
            this.failAck = failAck;
        }
    }

    private static final class StubJobService extends GenerateJobService {
        private String failureReason;

        private StubJobService() {
            super(null, null, null);
        }

        @Override
        public void updateStatus(String jobId, com.webgen.webgen_backend.portfolio.dto.JobStatusDTO.Status status) {
        }

        @Override
        public void failJob(String jobId, String error) {
            failureReason = error;
        }
    }

    private static final class StubPortfolioAiService implements PortfolioAiService {
        private final boolean failGeneration;
        private UUID receivedReservationId;

        private StubPortfolioAiService(boolean failGeneration) {
            this.failGeneration = failGeneration;
        }

        @Override
        public void generatePortfolio(
                UUID portfolioId,
                UUID userId,
                PortfolioGenerateRequestDTO req,
                String jobId,
                UUID creditReservationId
        ) {
            receivedReservationId = creditReservationId;
            if (failGeneration) {
                throw new IllegalStateException("upstream failed");
            }
        }

        @Override
        public void generateSingleSectionFromQueue(SectionGenerationMessage msg) {
        }

        @Override
        public SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req) {
            throw new UnsupportedOperationException();
        }
    }

    private static final class StubBuilderService implements BuilderService {
        private final boolean failSection;

        private StubBuilderService(boolean failSection) {
            this.failSection = failSection;
        }

        @Override
        public BuilderResponseDTO build(
                BuilderRequestDTO req,
                UUID userId
        ) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void refineSingleSectionFromQueue(SectionGenerationMessage msg) {
            if (failSection) {
                throw new IllegalStateException("section failed");
            }
        }
    }

    private static final class StubCreditGuardService implements CreditGuardService {
        private UUID refundedReservationId;
        private String failureReason;

        @Override
        public void assertUsageAvailable(UUID profileId, CreditUsagePolicy policy) {
            throw new UnsupportedOperationException("Not used by this test");
        }

        @Override
        public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void refundCredits(UUID reservationId, String reason) {
            refundedReservationId = reservationId;
            failureReason = reason;
        }
    }
}
