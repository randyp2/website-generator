package com.webgen.webgen_backend.resume_service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.service.llm.LlmResumeParserService;
import com.webgen.webgen_backend.resume.service.llm.ResumeParserPromptBuilder;
import com.webgen.webgen_backend.resume.service.llm.ResumeParserResponseParser;
import org.junit.jupiter.api.BeforeEach;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LlmResumeParserServiceTest {

    private FakeChatModel chatModel;
    private LlmResumeParserService service;

    @BeforeEach
    void setUp() {
        chatModel = new FakeChatModel();
        service = new LlmResumeParserService(
                chatModel,
                new ResumeParserPromptBuilder(),
                new ResumeParserResponseParser(new ObjectMapper())
        );
        ReflectionTestUtils.setField(service, "maxRetries", 3);
    }

    @Test
    void parsesValidModelJsonIntoResume() {
        chatModel.enqueue(validResumeJson());

        ParsedResume resume = service.parseWithLlm(rawResumeText(), normalizedResumeText());

        assertThat(resume.getFullName()).isEqualTo("Jane Doe");
        assertThat(resume.getEmail()).isEqualTo("jane@example.com");
        assertThat(resume.getSkills()).containsExactly("Java", "React", "Spring");
        assertThat(resume.getExperiences()).hasSize(1);
        assertThat(resume.getExperiences().getFirst().getBullets())
                .containsExactly("Built APIs serving 100 customers");
        assertThat(resume.getRawText()).isEqualTo(rawResumeText());
        assertThat(resume.getNormalizedText()).isEqualTo(normalizedResumeText());

        assertThat(chatModel.prompts()).hasSize(1);
        assertThat(chatModel.prompts().getFirst().getUserMessage().getText())
                .contains("Parse the following resume text")
                .contains(normalizedResumeText());
    }

    @Test
    void retriesWithValidationContextWhenModelReturnsInvalidJsonFirst() {
        chatModel.enqueue("not json");
        chatModel.enqueue(validResumeJson());

        ParsedResume resume = service.parseWithLlm(rawResumeText(), normalizedResumeText());

        assertThat(resume.getFullName()).isEqualTo("Jane Doe");
        assertThat(chatModel.prompts()).hasSize(2);
        Prompt retryPrompt = chatModel.prompts().get(1);
        assertThat(retryPrompt.getUserMessage().getText())
                .contains("--- RETRY REQUEST ---")
                .contains("not json")
                .contains("Failed to parse LLM response");
    }

    @Test
    void throwsAfterConfiguredRetriesWhenResponsesStayInvalid() {
        ReflectionTestUtils.setField(service, "maxRetries", 2);
        chatModel.enqueue("{}");
        chatModel.enqueue("{}");

        assertThatThrownBy(() -> service.parseWithLlm(rawResumeText(), normalizedResumeText()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to parse resume with LLM after 2 attempts")
                .hasMessageContaining("Resume must have at least name, email, or phone");

        assertThat(chatModel.prompts()).hasSize(2);
    }

    private String rawResumeText() {
        return """
                Jane Doe
                jane@example.com
                Java React Spring
                """;
    }

    private String normalizedResumeText() {
        return """
                Jane Doe
                jane@example.com
                Skills
                Java, React, Spring
                Experience
                Acme Corp Jan 2024 - Present
                Software Engineer
                Built APIs serving 100 customers
                """;
    }

    private String validResumeJson() {
        return """
                {
                  "fullName": "Jane Doe",
                  "email": "jane@example.com",
                  "phone": "(702) 555-1234",
                  "location": "Las Vegas, NV",
                  "summary": "Software engineer building reliable web platforms.",
                  "skills": ["Java", "React", "Spring"],
                  "experiences": [
                    {
                      "title": "Software Engineer",
                      "company": "Acme Corp",
                      "startDate": "Jan 2024",
                      "endDate": "Present",
                      "location": "Las Vegas, NV",
                      "bullets": ["Built APIs serving 100 customers"]
                    }
                  ],
                  "projects": [],
                  "educations": [
                    {
                      "degree": "B.S. Computer Science",
                      "institution": "University of Nevada, Las Vegas",
                      "graduationDate": "May 2025",
                      "location": "Las Vegas, NV",
                      "gpa": null
                    }
                  ]
                }
                """;
    }

    private static final class FakeChatModel implements ChatModel {

        private final Queue<String> responses = new ArrayDeque<>();
        private final List<Prompt> prompts = new ArrayList<>();

        void enqueue(String response) {
            responses.add(response);
        }

        List<Prompt> prompts() {
            return prompts;
        }

        @Override
        public ChatResponse call(Prompt prompt) {
            prompts.add(prompt);
            String response = responses.remove();
            return new ChatResponse(List.of(new Generation(new AssistantMessage(response))));
        }
    }
}
