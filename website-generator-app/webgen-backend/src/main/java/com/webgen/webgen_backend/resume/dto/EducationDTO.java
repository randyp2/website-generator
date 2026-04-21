package com.webgen.webgen_backend.resume.dto;

import lombok.Data;

@Data
public class EducationDTO {

    private String institution;
    private String degree;
    private String startDate, endDate;
    private String gpa;

    private String awards;
    private String courseWork;
}
