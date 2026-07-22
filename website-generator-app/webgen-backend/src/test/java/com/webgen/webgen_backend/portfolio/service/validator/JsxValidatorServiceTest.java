package com.webgen.webgen_backend.portfolio.service.validator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class JsxValidatorServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void stderrWarningDoesNotCorruptJsonValidationResult(CapturedOutput output) throws IOException {
        Path validatorScript = tempDir.resolve("validator-with-warning.sh");
        Files.writeString(validatorScript, """
                cat >/dev/null
                printf '%s\n' 'Warning: simulated React warning' >&2
                printf '%s' '{"valid":true,"errors":[]}'
                """);

        ObjectMapper objectMapper = new ObjectMapper();
        JsxValidatorService service = new JsxValidatorService(objectMapper);
        ReflectionTestUtils.setField(service, "nodePath", "/bin/sh");
        ReflectionTestUtils.setField(service, "scriptPath", validatorScript.toString());

        SectionDTO section = new SectionDTO();
        section.setSectionKey("projects");
        section.setReactSource("export default function Projects({ data }) { return null; }");
        section.setContentJson(objectMapper.createObjectNode());

        ValidationResult result = service.validateGeneratedSection(section);

        assertThat(result.isValid())
                .withFailMessage("Validation errors: %s", result.getErrors())
                .isTrue();
        assertThat(result.getErrors()).isEmpty();
        assertThat(output).contains(
                "JSX validator stderr sectionKey=projects output=Warning: simulated React warning"
        );
    }
}
