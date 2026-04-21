package com.webgen.webgen_backend.resume.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProjectDTO {
    private String rawBlock; // For debugging delete later !
    private String header;
    private List<String> bullets;
    private String link;

}
