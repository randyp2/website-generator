package com.webgen.webgen_backend.portfolio_service.validator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.dto.portfolio.common.SectionDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ModifiedSectionDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JsxValidatorService {
    private final ObjectMapper objectMapper;

    @Value("${jsx.validator.script.path:scripts/validate-jsx.js}")
    private String scriptPath;

    @Value("${jsx.validator.node.path:node}")
    private String nodePath;

    public ValidationResult validateGeneratedSection(SectionDTO section) {
        ValidationResult result = new ValidationResult();
        result.setValid(true);
        result.setErrors(new ArrayList<>());

        if (section.getReactSource() == null || section.getReactSource().isBlank())
            return createErrorResult(section.getSectionKey(), "React source is null or blank");

        ValidationResult sectionResult = validateSingleSection(
                section.getSectionKey(),
                section.getReactSource(),
                section.getContentJson()
        );

        if (!sectionResult.isValid()) {
            result.setValid(false);
            result.getErrors().addAll(sectionResult.getErrors());
        }

        return result;
    }

    public ValidationResult validateSections(List<ModifiedSectionDTO> sections) {
        ValidationResult result = new ValidationResult();
        result.setValid(true);
        result.setErrors(new ArrayList<>());

        for (ModifiedSectionDTO section : sections) {
            if (section.getReactSource() == null || section.getReactSource().isBlank()) {
                continue;
            }

            JsonNode contentJsonNode = section.getContentJson() != null
                    ? objectMapper.valueToTree(section.getContentJson())
                    : null;

            ValidationResult sectionResult = validateSingleSection(
                    section.getSectionKey(),
                    section.getReactSource(),
                    contentJsonNode
            );

            if (!sectionResult.isValid()) {
                result.setValid(false);
                result.getErrors().addAll(sectionResult.getErrors());
            }
        }

        return result;
    }

    private ValidationResult validateSingleSection(String sectionKey, String reactSource, JsonNode contentJson) {
        try {
            ProcessBuilder pb = new ProcessBuilder(nodePath, scriptPath);
            pb.redirectErrorStream(true);

            Process process = pb.start();

            // Write JSON payload with reactSource and contentJson to stdin
            try (OutputStream os = process.getOutputStream()) {
                ObjectNode payload = objectMapper.createObjectNode();
                payload.put("reactSource", reactSource);
                if (contentJson != null) {
                    payload.set("contentJson", contentJson);
                }
                os.write(objectMapper.writeValueAsBytes(payload));
                os.flush();
            }

            // Read result from stdout
            String output;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().collect(Collectors.joining());
            }

            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return createErrorResult(sectionKey, "Validation timed out after 30 seconds");
            }

            // Parse JSON result
            JsonNode json = objectMapper.readTree(output);
            ValidationResult result = new ValidationResult();
            result.setValid(json.path("valid").asBoolean(false));

            List<ValidationResult.ValidationError> errors = new ArrayList<>();
            for (JsonNode errorNode : json.path("errors")) {
                ValidationResult.ValidationError error = new ValidationResult.ValidationError();
                error.setSectionKey(sectionKey);
                error.setMessage(errorNode.path("message").asText("Unknown error"));
                error.setLine(errorNode.path("line").isNull() ? null : errorNode.path("line").asInt());
                error.setColumn(errorNode.path("column").isNull() ? null : errorNode.path("column").asInt());
                errors.add(error);
            }
            result.setErrors(errors);

            return result;

        } catch (Exception e) {
            return createErrorResult(sectionKey, "Validation process error: " + e.getMessage());
        }
    }

    private ValidationResult createErrorResult(String sectionKey, String message) {
        ValidationResult result = new ValidationResult();
        result.setValid(false);
        ValidationResult.ValidationError error = new ValidationResult.ValidationError();
        error.setSectionKey(sectionKey);
        error.setMessage(message);
        result.setErrors(List.of(error));
        return result;
    }
}
