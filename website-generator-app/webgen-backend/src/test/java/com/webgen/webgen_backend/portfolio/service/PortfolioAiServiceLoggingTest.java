package com.webgen.webgen_backend.portfolio.service;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.BlueprintDTO;
import com.webgen.webgen_backend.portfolio.dto.BlueprintSectionPlanDTO;
import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.portfolio.service.fallback.FallbackSectionFactory;
import com.webgen.webgen_backend.portfolio.service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio.service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio.service.parser.PortfolioResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.PortfolioPromptBuilder;
import com.webgen.webgen_backend.portfolio.service.prompt.PromptRefinerService;
import com.webgen.webgen_backend.portfolio.service.validator.JsxValidatorService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PortfolioAiServiceLoggingTest {

    private Logger logger;
    private Level originalLevel;
    private ListAppender<ILoggingEvent> appender;

    @BeforeEach
    void captureOperationalLogs() {
        logger = (Logger) LoggerFactory.getLogger(PortfolioAiServiceImpl.class);
        originalLevel = logger.getLevel();
        logger.setLevel(Level.INFO);
        appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
    }

    @AfterEach
    void stopCapturingLogs() {
        logger.detachAppender(appender);
        logger.setLevel(originalLevel);
    }

    @Test
    void logsAttemptFailureRetryValidationSuccessAndSectionSuccess() {
        ChatModel sectionModel = mock(ChatModel.class);
        ChatModel repairModel = mock(ChatModel.class);
        GenerateJobService jobService = mock(GenerateJobService.class);
        PortfolioPromptBuilder promptBuilder = mock(PortfolioPromptBuilder.class);
        PortfolioResponseParser parser = mock(PortfolioResponseParser.class);
        JsxValidatorService validator = mock(JsxValidatorService.class);

        PortfolioAiServiceImpl service = new PortfolioAiServiceImpl(
                mock(ChatModel.class),
                sectionModel,
                repairModel,
                jobService,
                mock(PromptRefinerService.class),
                promptBuilder,
                parser,
                validator,
                mock(FallbackSectionFactory.class),
                mock(PortfolioRepository.class),
                mock(GeneratedVersionRepository.class),
                mock(PortfolioSectionRepository.class),
                new ObjectMapper()
        );
        ReflectionTestUtils.setField(service, "maxRetries", 3);

        Prompt prompt = new Prompt("test prompt");
        ChatResponse response = new ChatResponse(
                List.of(new Generation(new AssistantMessage("section json")))
        );
        when(promptBuilder.buildSectionPrompt(any(), any(), any(), any())).thenReturn(prompt);
        when(promptBuilder.buildSectionRetryPrompt(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(prompt);
        when(sectionModel.call(prompt)).thenReturn(response);
        when(repairModel.call(prompt)).thenReturn(response);
        when(parser.parseSingleSectionResponse("section json"))
                .thenAnswer(invocation -> section());
        when(validator.validateGeneratedSection(any(SectionDTO.class)))
                .thenReturn(failedValidation(), validValidation());
        when(jobService.incrementCompleted("job-123")).thenReturn(1);

        service.generateSingleSectionFromQueue(message());

        assertThat(messages()).anyMatch(message -> message.contains(
                "Portfolio section attempt started jobId=job-123 portfolioId=portfolio-123 "
                        + "sectionKey=hero attempt=1/3 model=primary"
        ));
        assertThat(messages()).anyMatch(message -> message.contains(
                "Portfolio section validation failed jobId=job-123 portfolioId=portfolio-123 "
                        + "sectionKey=hero attempt=1/3"
        ));
        assertThat(messages()).anyMatch(message -> message.contains(
                "Portfolio section attempt started jobId=job-123 portfolioId=portfolio-123 "
                        + "sectionKey=hero attempt=2/3 model=repair"
        ));
        assertThat(messages()).anyMatch(message -> message.contains(
                "Portfolio section validation passed jobId=job-123 portfolioId=portfolio-123 "
                        + "sectionKey=hero attempt=2/3"
        ));
        assertThat(messages()).anyMatch(message -> message.contains(
                "Portfolio section generation succeeded jobId=job-123 portfolioId=portfolio-123 "
                        + "sectionKey=hero attempts=2 outcome=GENERATED progress=1/2"
        ));
    }

    private List<String> messages() {
        return appender.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
    }

    private SectionGenerationMessage message() {
        BlueprintSectionPlanDTO plan = new BlueprintSectionPlanDTO();
        plan.setSectionKey("hero");
        plan.setTitle("Hero");
        plan.setOrderIndex(1);

        SectionGenerationMessage message = new SectionGenerationMessage();
        message.setJobId("job-123");
        message.setPortfolioId("portfolio-123");
        message.setTotalSections(2);
        message.setReq(new PortfolioGenerateRequestDTO());
        message.setBlueprint(new BlueprintDTO());
        message.setPlanItem(plan);
        return message;
    }

    private SectionDTO section() {
        SectionDTO section = new SectionDTO();
        section.setSectionKey("hero");
        section.setTitle("Hero");
        section.setOrderIndex(1);
        section.setContentJson(new ObjectMapper().createObjectNode());
        section.setReactSource("export default function HeroSection({ data }) { return <section id=\"hero\" />; }");
        return section;
    }

    private ValidationResult failedValidation() {
        ValidationResult.ValidationError error = new ValidationResult.ValidationError();
        error.setMessage("Missing required element");
        error.setLine(1);
        error.setColumn(1);

        ValidationResult result = new ValidationResult();
        result.setValid(false);
        result.setErrors(List.of(error));
        return result;
    }

    private ValidationResult validValidation() {
        ValidationResult result = new ValidationResult();
        result.setValid(true);
        result.setErrors(List.of());
        return result;
    }
}
