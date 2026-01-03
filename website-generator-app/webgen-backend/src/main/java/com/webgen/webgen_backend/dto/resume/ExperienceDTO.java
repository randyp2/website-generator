package com.webgen.webgen_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class ExperienceDTO {
    private String rawBlock; // Remove later

    private String title; // Title of role

    // Company and experience metadata
    private String company;
    private String startDate, endDate;
    private String location;

    // Descriptions about experience
    private List<String> bullets;
}
