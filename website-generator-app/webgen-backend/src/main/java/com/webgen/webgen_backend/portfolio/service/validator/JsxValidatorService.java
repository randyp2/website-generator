package com.webgen.webgen_backend.portfolio.service.validator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ModifiedSectionDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class JsxValidatorService {
    private static final int MAX_STDERR_LOG_LENGTH = 4_000;

    private final ObjectMapper objectMapper;

    @Value("${jsx.validator.script.path:scripts/validate-jsx.js}")
    private String scriptPath;

    @Value("${jsx.validator.node.path:node}")
    private String nodePath;

    /**
     * Validates a single AI-generated section's JSX by delegating to the Node.js validator script.
     * Returns an error result immediately if reactSource is blank.
     *
     * @param section section DTO containing sectionKey, reactSource, and contentJson
     * @return validation result with a list of errors (empty when valid)
     */
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

    /**
     * Validates all modified sections in a builder request, collecting errors across sections.
     * Sections with a blank reactSource are skipped (treated as pass-through with no code change).
     *
     * @param sections list of modified sections from a builder refinement request
     * @return aggregated validation result across all sections
     */
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

    /*
     * Spawns a Node.js subprocess to validate JSX syntax using Babel.
     * JSX parsing cannot be done in the JVM, so we delegate to scripts/validate-jsx.js
     * via stdin/stdout. The script receives a JSON payload and writes back a JSON result.
     *
     * Stdout and stderr are consumed concurrently so the 30-second timeout governs the
     * whole validation. Stdout remains the JSON protocol while stderr is diagnostic.
     * A hung render would otherwise block the calling worker thread forever.
     */
    private ValidationResult validateSingleSection(String sectionKey, String reactSource, JsonNode contentJson) {
        try {
            ProcessBuilder pb = new ProcessBuilder(nodePath, scriptPath);
            pb.redirectErrorStream(false);

            Process process = pb.start();
            StreamCapture stdout = captureStream(
                    process.getInputStream(),
                    "jsx-validator-stdout-" + sectionKey
            );
            StreamCapture stderr = captureStream(
                    process.getErrorStream(),
                    "jsx-validator-stderr-" + sectionKey
            );

            // --- Write JSON payload with reactSource and contentJson to stdin
            try (OutputStream os = process.getOutputStream()) {
                ObjectNode payload = objectMapper.createObjectNode();
                payload.put("reactSource", reactSource);
                if (contentJson != null) {
                    payload.set("contentJson", contentJson);
                }
                os.write(objectMapper.writeValueAsBytes(payload));
                os.flush();
            }

            // --- Enforce the hard timeout on the process itself
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return createErrorResult(sectionKey, "Validation timed out after 30 seconds");
            }

            stdout.awaitCompletion();
            stderr.awaitCompletion();

            String stderrOutput = stderr.content().strip();
            if (!stderrOutput.isBlank()) {
                log.warn("JSX validator stderr sectionKey={} output={}",
                        sectionKey, truncateForLog(stderrOutput));
            }

            if (process.exitValue() != 0) {
                return createErrorResult(
                        sectionKey,
                        "Validation process exited with code " + process.exitValue()
                );
            }

            String output = stdout.content().strip();
            if (output.isBlank()) {
                return createErrorResult(sectionKey, "Validation process returned empty stdout");
            }

            // --- Parse JSON result
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

    private StreamCapture captureStream(InputStream stream, String threadName) {
        StringBuilder buffer = new StringBuilder();
        Thread readerThread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                reader.lines().forEach(line -> buffer.append(line).append(System.lineSeparator()));
            } catch (Exception ignored) {
                // Stream closure after process termination leaves any partial output available.
            }
        }, threadName);
        readerThread.setDaemon(true);
        readerThread.start();
        return new StreamCapture(buffer, readerThread);
    }

    private String truncateForLog(String output) {
        if (output.length() <= MAX_STDERR_LOG_LENGTH) {
            return output;
        }
        return output.substring(0, MAX_STDERR_LOG_LENGTH) + " [truncated]";
    }

    private record StreamCapture(StringBuilder buffer, Thread readerThread) {
        private void awaitCompletion() throws InterruptedException {
            readerThread.join(5_000);
        }

        private String content() {
            return buffer.toString();
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
