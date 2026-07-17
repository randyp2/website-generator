package com.webgen.webgen_backend.account.controller;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import com.webgen.webgen_backend.account.service.AccountDeletionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AccountDeletionControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void startsDeletionForAuthenticatedUserAndReportsProgress() throws Exception {
        UUID profileId = UUID.randomUUID();
        RecordingAccountDeletionService service = new RecordingAccountDeletionService();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
                new AccountDeletionController(service)
        ).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(profileId.toString(), null)
        );

        mockMvc.perform(delete("/api/v1/account")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"confirmation\":\"DELETE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stage").value("COMPLETED"))
                .andExpect(jsonPath("$.accountDeleted").value(true));

        assertThat(service.profileId).isEqualTo(profileId);
        assertThat(service.request.getConfirmation()).isEqualTo("DELETE");
    }

    private static final class RecordingAccountDeletionService
            extends AccountDeletionService {

        private UUID profileId;
        private DeleteAccountRequestDTO request;

        private RecordingAccountDeletionService() {
            super(null, null, null, null, null);
        }

        @Override
        public AccountDeletionProgressDTO beginAccountDeletion(
                UUID profileId,
                DeleteAccountRequestDTO request
        ) {
            this.profileId = profileId;
            this.request = request;
            return AccountDeletionProgressDTO.builder()
                    .stage(AccountDeletionStage.COMPLETED)
                    .accountDeleted(true)
                    .build();
        }
    }
}
