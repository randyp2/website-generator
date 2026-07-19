package com.webgen.webgen_backend.portfolio.dto.style;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Wire-format contract with the frontend (StyleChatResponse in types/style.ts).
 * Lombok's isComplete() getter would make Jackson emit "complete" unless the
 * property name is pinned; the frontend only reads "isComplete".
 */
class StyleChatResponseDTOTest {

    @Test
    void serializesCompletionFlagAsIsComplete() throws Exception {
        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        dto.setComplete(true);

        JsonNode json = new ObjectMapper().readTree(
                new ObjectMapper().writeValueAsString(dto));

        assertTrue(json.path("isComplete").asBoolean(),
                "frontend contract requires the field to be named isComplete");
        assertFalse(json.has("complete"),
                "the flag must not be duplicated under Jackson's derived name");
    }
}
