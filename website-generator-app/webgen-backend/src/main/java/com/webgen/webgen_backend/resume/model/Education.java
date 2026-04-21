package com.webgen.webgen_backend.resume.model;

import lombok.Data;

@Data
public class Education {

    private String institution;
    private String degree;
    private String startDate, endDate;
    private String gpa;

    private String awards;
    private String courseWork;
}
