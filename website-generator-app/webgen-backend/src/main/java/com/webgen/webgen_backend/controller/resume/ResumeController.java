package com.webgen.webgen_backend.controller;


import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.resume_service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeParserService resumeParserService;


    // Health check ping
    @GetMapping("/ping")
    public String ping () {return "API RESUME ENDPOINT WORKING!";}



    // Parses a resume PDF and return structured data
    // Pass ?llmFallback=false to skip the LLM fallback (regex-only, zero token cost)
    @PostMapping(
            value = "/parse",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ParsedResumeDTO> parseResume(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "llmFallback", required = false) Boolean llmFallback
    ) {
        ParsedResumeDTO parsedResumeDto = resumeParserService.parseResume(file, llmFallback);
        return ResponseEntity.ok(parsedResumeDto);
    }

}
