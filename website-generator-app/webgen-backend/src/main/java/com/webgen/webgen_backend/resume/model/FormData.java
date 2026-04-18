package com.webgen.webgen_backend.resume.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FormData {

    private String name;
    private String tagline;
    private String about;
    private List<String> skills;
    private String email;
    private String github;
    private String linkedin;
    private String customStyle;
    private String theme;
    private String themeField;
    private String customSectionTitle;
    private String customSectionContent;


}

