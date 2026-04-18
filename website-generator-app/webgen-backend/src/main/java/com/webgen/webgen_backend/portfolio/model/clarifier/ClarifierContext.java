package com.webgen.webgen_backend.portfolio.model.clarifier;


import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ClarifierContext {

    // Determine if clarifying is still needed
    // Check if enough information has been resolved
    private double confidenceScore;

    // The overall intent of the user's refinement prompt
    private String globalIntent;

    // Section level intent of user's prompt
    // sectionKey -> intent
    private Map<String, String> sectionIntents;

    // List of sections that are susceptible to refinement
    private List<String> targetSectionKeys;

    // unknown - Doesn't know scope must continue clarifying
    // section - One section refinement
    // multi   - Multiple section level refinement
    // global  - Whole portfolio refinement
    private String scope;

    // List of unresolved decisions
    // Contains topics that are unresolved
    // !!! Must be empty for clarifier to finish
    //      - !!! Must be nonempty for clarifier to continue
    // i.e. Visual_mode -> Do you prefer a clean light theme or dark mode
    private List<String> openQuestions;

    // List of assumptions ai makes from user prompt
    // Can be accepted or rejected
    private List<String> assumptions;

    // Guardrails
    private ClarifierConstraints constraints;

    // Incase referencing is needed to build a more conversational flow
    private String lastUserMessage;

    // Keep track of how many clarifications have been made prevents infinite conversations
    private int turnCount;
}
