package com.webgen.webgen_backend.resume_service.extraction;

import com.webgen.webgen_backend.model.ParsedResume;
import com.webgen.webgen_backend.resume_service.ResumeTestHelper;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@Tag("requires-fixtures")
class ContactInfoExtractionServiceTest {

    private final ContactInfoExtractionService service = new ContactInfoExtractionService();

    // ========================================================================
    // Real resume extraction — runs against every test resume and logs
    // what was extracted. This catches regressions across diverse formats.
    // ========================================================================
    @Nested
    class RealResumeExtraction {

        @Test
        void extractsContactInfoFromAllResumes() {
            ResumeTestHelper.logHeader("CONTACT INFO EXTRACTION REPORT");

            Map<String, String> resumes = ResumeTestHelper.loadAllResumes();

            for (var entry : resumes.entrySet()) {
                ParsedResume resume = new ParsedResume();
                service.extractContactInfo(resume, entry.getValue());

                System.out.printf("  [%-25s] Name: %-25s | Email: %-30s | Phone: %-15s | Location: %s%n",
                        entry.getKey(),
                        resume.getFullName() != null ? resume.getFullName() : "NOT FOUND",
                        resume.getEmail() != null ? resume.getEmail() : "NOT FOUND",
                        resume.getPhone() != null ? resume.getPhone() : "NOT FOUND",
                        resume.getLocation() != null ? resume.getLocation() : "NOT FOUND"
                );
            }
            System.out.println("=".repeat(75));
        }
    }

    // ========================================================================
    // Name extraction — the trickiest part. The first line of a resume
    // can contain emails, phone numbers, LinkedIn URLs, etc. that must
    // be stripped to isolate the name.
    // ========================================================================
    @Nested
    class NameExtraction {

        @Test
        void extractsNameFromCleanFirstLine() {
            // Simplest case: name is the only thing on line 1
            String text = "Randy Pahang II\n702-609-6580\nrpahang2@gmail.com";

            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, text);

            assertThat(resume.getFullName()).isEqualTo("Randy Pahang II");
        }

        @Test
        void extractsNameWhenFirstLineHasContactInfo() {
            // Name shares line 1 with phone and email — must strip them
            String text = "John Smith 702-555-1234 john@email.com\nSUMMARY";

            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, text);

            assertThat(resume.getFullName()).isNotNull();
            assertThat(resume.getFullName()).contains("John");
            assertThat(resume.getFullName()).doesNotContain("702");
            assertThat(resume.getFullName()).doesNotContain("@");
        }

        @Test
        void returnsNullForEmptyInput() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "");

            assertThat(resume.getFullName()).isNull();
        }

        @Test
        void returnsNullForNullInput() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, null);

            assertThat(resume.getFullName()).isNull();
        }
    }

    // ========================================================================
    // Email extraction — uses regex to find email anywhere in the text.
    // Must handle various email formats and not match false positives.
    // ========================================================================
    @Nested
    class EmailExtraction {

        @Test
        void extractsStandardEmail() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "Contact: john.doe@example.com\nMore text");

            assertThat(resume.getEmail()).isEqualTo("john.doe@example.com");
        }

        @Test
        void extractsEmailWithPlusSign() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "Email: user+tag@gmail.com");

            assertThat(resume.getEmail()).isEqualTo("user+tag@gmail.com");
        }

        @Test
        void returnsNullWhenNoEmail() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "No email here\nJust text");

            assertThat(resume.getEmail()).isNull();
        }
    }

    // ========================================================================
    // Phone extraction — must handle (xxx) xxx-xxxx, xxx-xxx-xxxx,
    // xxx.xxx.xxxx formats and normalize to (xxx) xxx-xxxx.
    // ========================================================================
    @Nested
    class PhoneExtraction {

        @Test
        void extractsAndFormatsParenthesizedPhone() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "Phone: (702) 609-6580");

            assertThat(resume.getPhone()).isEqualTo("(702) 609-6580");
        }

        @Test
        void extractsAndFormatsDashedPhone() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "702-609-6580");

            assertThat(resume.getPhone()).isEqualTo("(702) 609-6580");
        }

        @Test
        void returnsNullWhenNoPhone() {
            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, "No phone number here");

            assertThat(resume.getPhone()).isNull();
        }
    }

    // ========================================================================
    // Location extraction — matches "City, ST" pattern in first 5 lines.
    // ========================================================================
    @Nested
    class LocationExtraction {

        @Test
        void extractsLocationFromEarlyLines() {
            String text = "John Doe\nLas Vegas, NV\njohn@email.com\nSUMMARY";

            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, text);

            assertThat(resume.getLocation()).isEqualTo("Las Vegas, NV");
        }

        @Test
        void ignoresLocationDeepInText() {
            // Location in line 10 (experience section) should not be picked up
            // as the user's location — only first 5 lines are checked
            StringBuilder text = new StringBuilder("John Doe\njohn@email.com\n");
            for (int i = 0; i < 10; i++) text.append("filler line\n");
            text.append("San Francisco, CA");

            ParsedResume resume = new ParsedResume();
            service.extractContactInfo(resume, text.toString());

            // Location should be null — it's not in the first 5 lines
            assertThat(resume.getLocation()).isNull();
        }
    }
}
