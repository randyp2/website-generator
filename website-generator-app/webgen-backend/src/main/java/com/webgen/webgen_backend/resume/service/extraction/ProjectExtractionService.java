package com.webgen.webgen_backend.resume.service.extraction;

import com.webgen.webgen_backend.resume.model.Project;
import com.webgen.webgen_backend.resume.service.utils.SectionExtractor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectExtractionService {


    /**
     * Extract projects and all metadata attached to them
     *
     * @param text - normalized resume text
     * @return list of projects
     */
    public List<Project> extractProjects(String text) {
        String projectSection = SectionExtractor.extractSection(
                text,
                "PROJECTS|PERSONAL PROJECTS|SIDE PROJECTS",
                "SKILLS|EDUCATION|EXPERIENCE|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS"
        );

        List<Project> projects = new ArrayList<>();


        if (projectSection.isBlank())
            return projects;


        String[] lines = projectSection.split("\n");

        // Two-pass approach: find project boundaries first
        List<Integer> projectStarts = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // A project header is:
            // 1. Not a bullet point
            // 2. Relatively short (< 100 chars)
            // 3. Has bullets within the next 3 lines
            if (!line.startsWith("-") && line.length() < 100) {
                // Look ahead for bullets within next 3 lines
                boolean hasBulletsNearby = false;
                for (int j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                    String nextLine = lines[j].trim();
                    if (!nextLine.isEmpty() && nextLine.startsWith("-")) {
                        hasBulletsNearby = true;
                        break;
                    }
                }

                if (hasBulletsNearby) {
                    projectStarts.add(i);
                }
            }
        }

        // Extract projects using boundaries
        for (int idx = 0; idx < projectStarts.size(); idx++) {
            int startIdx = projectStarts.get(idx);
            int endIdx = (idx + 1 < projectStarts.size())
                    ? projectStarts.get(idx + 1)
                    : lines.length;

            StringBuilder rawBlock = new StringBuilder();

            for (int i = startIdx; i < endIdx; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                rawBlock.append(line).append("\n");
            }

            if (rawBlock.isEmpty()) continue;

            Project project = new Project();
            project.setRawBlock(rawBlock.toString().trim());
            parseProjectContent(project);
            projects.add(project);
        }

        return projects;
    }

    private void parseProjectContent(Project project) {
        String[] lines = project.getRawBlock().split("\n");
        if (lines.length == 0) return;

        // Find where bullets start
        int bulletStartIdx = -1;
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith("-")) {
                bulletStartIdx = i;
                break;
            }
        }

        // Everything before bullets is the header (may be multi-line)
        StringBuilder header = new StringBuilder();
        int headerEndIdx = (bulletStartIdx != -1) ? bulletStartIdx : lines.length;

        for (int i = 0; i < headerEndIdx; i++) {
            if (i > 0) header.append(" ");  // Join multi-line headers with space
            header.append(lines[i].trim());
        }

        project.setHeader(header.toString().trim());

        // Parse bullets if they exist
        if (bulletStartIdx != -1) {
            parseProjectBullets(project, bulletStartIdx);
        }
    }

    private void parseProjectBullets(Project project, int startIdx) {
        String[] lines = project.getRawBlock().split("\n");
        List<String> bullets = new ArrayList<>();

        StringBuilder currentBullet = null;
        for (int i = startIdx; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            if (line.startsWith("-")) {
                // Save previous bullet
                if (currentBullet != null) {
                    bullets.add(currentBullet.toString().trim());
                }

                // Start new bullet
                currentBullet = new StringBuilder();
                currentBullet.append(line.substring(1).trim());
            } else if (currentBullet != null) {
                // Continuation of current bullet
                currentBullet.append(" ").append(line);
            }
        }

        // Don't forget last bullet
        if (currentBullet != null) {
            bullets.add(currentBullet.toString().trim());
        }

        project.setBullets(bullets);
    }
}
