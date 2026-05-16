package com.webgen.webgen_backend.agent.controller;

import com.webgen.webgen_backend.agent.dto.AgentTurnRequestDTO;
import com.webgen.webgen_backend.agent.dto.AgentTurnResultDTO;
import com.webgen.webgen_backend.agent.service.AgentOrchestratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentOrchestratorController {

    private final AgentOrchestratorService agentOrchestratorService;

    @PostMapping("/turn")
    public ResponseEntity<AgentTurnResultDTO> turn(@RequestBody AgentTurnRequestDTO req) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );

        AgentTurnResultDTO response = agentOrchestratorService.processTurn(
                userId,
                req.getPortfolioId(),
                req.getUserMessage()
        );

        return ResponseEntity.ok(response);
    }
}
