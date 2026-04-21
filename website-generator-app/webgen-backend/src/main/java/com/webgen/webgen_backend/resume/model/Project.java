package com.webgen.webgen_backend.resume.model;


import lombok.Data;

import java.util.List;

@Data
public class Project {

    private String rawBlock;

    private String header;
    private List<String> bullets;
    private String link; // Optional link to project
}
