package com.webgen.webgen_backend.resume.service.llm;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Builds prompts for LLM-based resume parsing.
 */
@Service
public class ResumeParserPromptBuilder {

    /**
     * Build initial parsing prompt for LLM.
     * @param normalizedText The cleaned resume text to parse
     * @return Prompt for LLM
     */
    public Prompt buildParsePrompt(String normalizedText) {
        SystemMessage systemMessage = new SystemMessage(buildSystemMessage());
        UserMessage userMessage = new UserMessage(buildUserMessage(normalizedText));

        return new Prompt(List.of(systemMessage, userMessage));
    }

    /**
     * Build retry prompt when previous attempt failed validation.
     * @param normalizedText The cleaned resume text
     * @param previousResponse The previous LLM response that failed
     * @param errors List of validation errors from previous attempt
     * @return Prompt for retry
     */
    public Prompt buildRetryPrompt(String normalizedText, String previousResponse, List<String> errors) {
        SystemMessage systemMessage = new SystemMessage(buildSystemMessage());

        String userMessageText = buildUserMessage(normalizedText) +
            "\n\n--- RETRY REQUEST ---\n" +
            "Your previous response failed validation with these errors:\n" +
            String.join("\n", errors) + "\n\n" +
            "Previous response:\n" + previousResponse + "\n\n" +
            "Please fix these issues and provide a corrected JSON response.";

        UserMessage userMessage = new UserMessage(userMessageText);

        return new Prompt(List.of(systemMessage, userMessage));
    }

    /**
     * Build the system message defining the parsing task and output format.
     */
    private String buildSystemMessage() {
        return """
            You are an AI resume parsing specialist.

            Your task is to extract structured information from raw resume text and output it as JSON.

            CRITICAL RULES:
            1. Extract information EXACTLY AS IT APPEARS in the text - do NOT invent, infer, or make up data
            2. If a field is not clearly present, set it to null
            3. Preserve the original wording and formatting of text
            4. Output JSON ONLY - no markdown, backticks, or explanatory text
            5. Follow the exact schema provided below

            EXTRACTION GUIDELINES:

            Contact Information:
            - fullName: Extract the person's full name (usually at the top)
            - email: Extract email address (format: user@domain.com)
            - phone: Extract phone number (preserve formatting)
            - location: Extract city/state/country (e.g., "San Francisco, CA")

            Summary:
            - Extract 1-3 sentence professional summary or objective if present
            - Look for sections labeled: Summary, About, Objective, Profile
            - Set to null if not found

            Skills:
            - Extract individual skill names as separate strings
            - DO NOT categorize skills (e.g., no "Frontend", "Backend" grouping)
            - Look for sections labeled: Skills, Technologies, Technical Skills
            - Return empty array if not found

            Experiences:
            - Extract work experiences with structure:
              * title: Job title/role
              * company: Company/organization name
              * startDate: Start date (preserve format: "Jan 2020", "2020", etc.)
              * endDate: End date or "Present"
              * location: Job location if mentioned
              * bullets: Array of individual bullet points/achievements
            - Preserve bullet points separately (don't merge them)
            - Return empty array if not found

            Projects:
            - Extract personal/academic projects with structure:
              * header: Project name/title
              * bullets: Array of bullet points describing the project
              * link: URL/link to project if mentioned (null otherwise)
            - Return empty array if not found

            Education:
            - Extract educational background with structure:
              * degree: Degree name (e.g., "Bachelor of Science in Computer Science")
              * institution: School/university name
              * graduationDate: Graduation date (preserve format)
              * location: School location if mentioned
              * gpa: GPA if mentioned (as string, e.g., "3.8/4.0")
            - Return empty array if not found

            OUTPUT SCHEMA (JSON only):
            {
              "fullName": "string or null",
              "email": "string or null",
              "phone": "string or null",
              "location": "string or null",
              "summary": "string or null",
              "skills": ["string"],
              "experiences": [
                {
                  "title": "string or null",
                  "company": "string or null",
                  "startDate": "string or null",
                  "endDate": "string or null",
                  "location": "string or null",
                  "bullets": ["string"]
                }
              ],
              "projects": [
                {
                  "header": "string or null",
                  "bullets": ["string"],
                  "link": "string or null"
                }
              ],
              "educations": [
                {
                  "degree": "string or null",
                  "institution": "string or null",
                  "graduationDate": "string or null",
                  "location": "string or null",
                  "gpa": "string or null"
                }
              ]
            }

            Remember: Output ONLY the JSON object. No markdown code blocks, no explanations.
            """;
    }

    /**
     * Build the user message containing the resume text to parse.
     */
    private String buildUserMessage(String normalizedText) {
        return "Parse the following resume text and extract structured information as JSON:\n\n" +
               "--- RESUME TEXT ---\n" +
               normalizedText +
               "\n--- END RESUME TEXT ---\n\n" +
               "Output the extracted information as JSON following the schema provided in the system message.";
    }
}
