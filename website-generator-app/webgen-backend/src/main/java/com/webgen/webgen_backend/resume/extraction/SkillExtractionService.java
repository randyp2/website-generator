package com.webgen.webgen_backend.resume.extraction;


import com.webgen.webgen_backend.resume.utils.SectionExtractor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/* ====================================================================================*/
// Service class that helps extract skills
/* ====================================================================================*/
@Service
public class SkillExtractionService {

    /**
     * Extract skills form the SKILLS section of the resume
     *
     * @param text - normalized resume text
     * @return list of skill strings (empty if none exist)
     */
    public List<String> extractSkills(String text) {
        String skillsSection = SectionExtractor.extractSection(
                text,
                "SKILLS|TECHNICAL SKILLS|TECHNOLOGIES|COMPETENCIES|SKILLS & ABILITIES|SKILLS AND ABILITIES",  // Add variations
                "EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE"
        );

        List<String> skills = new ArrayList<>(); // Store skills section in list

        if (skillsSection.isBlank()) return skills; // Return empty list

        /**
         * Tokenize skills section based on delimiter
         *  - Commas
         *  - New lines
         *  - Bullet points (we converted to dashes)
         *  - Semicolons
         */
        String[] tokens = skillsSection.split("[,\n;-]");

        // Store skills in list
        for (String token : tokens) {
            if(token.isEmpty()) continue;
            if (token.length() < 2) continue;

            skills.add(token.trim());
        }

        return skills;
    }
}
