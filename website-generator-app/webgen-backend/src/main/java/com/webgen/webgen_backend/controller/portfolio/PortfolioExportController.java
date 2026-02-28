package com.webgen.webgen_backend.controller.portfolio;

import com.webgen.webgen_backend.dto.portfolio.PortfolioExportRequestDTO;
import com.webgen.webgen_backend.portfolio_service.export.PortfolioHtmlExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio/export")
@RequiredArgsConstructor
public class PortfolioExportController {

    private final PortfolioHtmlExportService htmlExportService;

    @PostMapping(value = "/html", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> exportAsHtml(@RequestBody PortfolioExportRequestDTO request) {
        if (request.getSections() == null || request.getSections().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("<!-- Error: No sections provided -->");
        }

        try {
            String html = htmlExportService.generateHtml(
                    request.getSections(),
                    request.getGlobalTheme(),
                    request.getPageTitle()
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"portfolio.html\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_HTML_VALUE)
                    .body(html);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("<!-- Error generating HTML: " + e.getMessage() + " -->");
        }
    }
}
