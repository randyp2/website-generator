package com.webgen.webgen_backend.model;

import lombok.Data;

import java.util.List;

@Data
public class Experience {

    // Store experience raw normalized text
    private String rawBlock;

    /**
     * Job title role
     * i.e. "Software Engineer", "Full-stack developer"
     */
    private String title;

    /**
     * Company or organization name
     * i.e. "Google", "Amazon"
     */
    private String company;

    /**
     * Experience metadata
     *  i.e. <month>-<year>
     *      Las Vegas, NV
     */
    private String startDate, endDate;
    private String location;

    /**
     * Stored bulleted list
     *  - converted into dashes during normalization
     */
    private List<String> bullets;

}