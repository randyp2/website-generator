package com.webgen.webgen_backend.controller;

import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio/refine")
@RequiredArgsConstructor
public class PortfolioRefineController {


    @PostMapping("/clarify")
    public ResponseEntity<ClarifierResponseDTO> clarify(
            @RequestBody ClarifierRequestDTO req
    ) {
        ClarifierResponseDTO response = clarifierService.clarify(req);
        return ResponseEntity.ok(response);
    }
}
