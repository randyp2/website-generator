package com.webgen.webgen_backend.portfolio.service.builder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.JobStatusDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio.service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio.service.parser.BuilderResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.BuilderPromptBuilder;
import com.webgen.webgen_backend.portfolio.service.validator.JsxValidatorService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

import static org.assertj.core.api.Assertions.assertThat;

class BuilderServiceModelRoutingTest {

    @Test
    void usesSectionModelFirstAndRepairModelAfterValidationFailure() {
        ObjectMapper objectMapper = new ObjectMapper();
        RecordingChatModel sectionModel = new RecordingChatModel(responseJson("first"));
        RecordingChatModel repairModel = new RecordingChatModel(responseJson("repaired"));
        SequencedValidator validator = new SequencedValidator(
                objectMapper,
                invalidResult(),
                validResult()
        );
        RecordingGenerateJobService jobService = new RecordingGenerateJobService(objectMapper);

        BuilderServiceImpl service = new BuilderServiceImpl(
                null,
                new BuilderPromptBuilder(objectMapper),
                new BuilderResponseParser(objectMapper),
                validator,
                null,
                null,
                jobService,
                objectMapper,
                null,
                null,
                null,
                null,
                null
        );
        ReflectionTestUtils.setField(service, "sectionModel", sectionModel);
        ReflectionTestUtils.setField(service, "sectionRepairModel", repairModel);
        ReflectionTestUtils.setField(service, "maxRetries", 2);

        service.refineSingleSectionFromQueue(message());

        assertThat(sectionModel.prompts()).hasSize(1);
        assertThat(repairModel.prompts()).hasSize(1);
        assertThat(repairModel.prompts().getFirst().getUserMessage().getText())
                .contains("Invalid JSX");
        assertThat(jobService.completedSections())
                .extracting(SectionDTO::getReactSource)
                .containsExactly("repaired");
    }

    private String responseJson(String reactSource) {
        return """
                {
                  "sectionKey": "hero",
                  "title": "Hero",
                  "orderIndex": 1,
                  "reactSource": "%s",
                  "contentJson": {},
                  "changeDescription": "Updated the hero section."
                }
                """.formatted(reactSource);
    }

    private SectionGenerationMessage message() {
        SectionPlanDTO plan = new SectionPlanDTO();
        plan.setSectionKey("hero");
        plan.setAction("modify");

        SectionGenerationMessage message = new SectionGenerationMessage();
        message.setJobId("job-1");
        message.setPortfolioId("portfolio-1");
        message.setUserId("user-1");
        message.setTotalSections(2);
        message.setMode(SectionGenerationMessage.Mode.REFINE);
        message.setRefinePlan(plan);
        message.setClarifierContext(new ClarifierContext());
        return message;
    }

    private ValidationResult invalidResult() {
        ValidationResult.ValidationError error = new ValidationResult.ValidationError();
        error.setMessage("Invalid JSX");

        ValidationResult result = new ValidationResult();
        result.setValid(false);
        result.setErrors(List.of(error));
        return result;
    }

    private ValidationResult validResult() {
        ValidationResult result = new ValidationResult();
        result.setValid(true);
        result.setErrors(List.of());
        return result;
    }

    private static final class RecordingChatModel implements ChatModel {

        private final Queue<String> responses = new ArrayDeque<>();
        private final List<Prompt> prompts = new ArrayList<>();

        private RecordingChatModel(String... responses) {
            this.responses.addAll(List.of(responses));
        }

        private List<Prompt> prompts() {
            return prompts;
        }

        @Override
        public ChatResponse call(Prompt prompt) {
            prompts.add(prompt);
            return new ChatResponse(
                    List.of(new Generation(new AssistantMessage(responses.remove())))
            );
        }
    }

    private static final class SequencedValidator extends JsxValidatorService {

        private final Queue<ValidationResult> results = new ArrayDeque<>();

        private SequencedValidator(
                ObjectMapper objectMapper,
                ValidationResult... results
        ) {
            super(objectMapper);
            this.results.addAll(List.of(results));
        }

        @Override
        public ValidationResult validateGeneratedSection(SectionDTO section) {
            return results.remove();
        }
    }

    private static final class RecordingGenerateJobService extends GenerateJobService {

        private final List<SectionDTO> completedSections = new ArrayList<>();

        private RecordingGenerateJobService(ObjectMapper objectMapper) {
            super(null, objectMapper, null);
        }

        private List<SectionDTO> completedSections() {
            return completedSections;
        }

        @Override
        public void updateStatus(String jobId, JobStatusDTO.Status status) {
        }

        @Override
        public void pushCompletedSection(String jobId, SectionDTO sectionDTO) {
            completedSections.add(sectionDTO);
        }

        @Override
        public int incrementCompleted(String jobId) {
            return 1;
        }
    }
}
