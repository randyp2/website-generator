package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
class VerificationScoringCalibrationTest {

    private final ScoringCalibrationHarness harness = new ScoringCalibrationHarness();

    @Test
    void reportsRepresentativeUsersAndPreservesCoreInvariants() {
        Map<String, ScoringCalibrationHarness.CalibrationResult> results = new LinkedHashMap<>();
        scenarios().forEach(scenario -> results.put(scenario.id(), harness.run(scenario)));

        logReport(results.values().stream().toList());

        assertThat(score(results, "claims_only_builder")).isEqualTo(50);
        assertThat(score(results, "untouched_fork"))
                .isLessThan(score(results, "one_commit_repository"));
        assertThat(score(results, "one_commit_repository"))
                .isLessThan(score(results, "active_repository"));
        assertThat(score(results, "authorship_api_unavailable"))
                .isEqualTo(score(results, "active_repository"));
        assertThat(score(results, "older_active_repository"))
                .isBetween(50, score(results, "active_repository") - 1);
        assertThat(score(results, "five_description_matches"))
                .isEqualTo(score(results, "claims_only_builder"));
        assertThat(score(results, "duplicate_reviewed_upload"))
                .isEqualTo(score(results, "strong_reviewed_artifact"));
        assertThat(score(results, "broad_profile_sparse_evidence"))
                .isLessThan(score(results, "active_repository"));
        assertThat(score(results, "expert_reviewed_portfolio")).isGreaterThan(80);
    }

    private List<ScoringCalibrationHarness.CalibrationScenario> scenarios() {
        return List.of(
                scenario("claims_only_builder", "Three recognized claims without evidence",
                        claim("React"), claim("Java"), claim("PostgreSQL")),
                scenario("untouched_fork", "Fresh dependency match on an untouched fork",
                        claim("React", github("fork", "fork-root", "dependency_match", "0.90", "0.30", 0))),
                scenario("one_commit_repository", "Fresh dependency match with one attributed commit",
                        claim("React", github("one commit", "repo-one", "dependency_match", "0.90", "0.75", 0))),
                scenario("active_repository", "Fresh dependency match with five attributed commits",
                        claim("React", github("active repo", "repo-active", "dependency_match", "0.90", "1.00", 0))),
                scenario("authorship_api_unavailable", "Active match with neutral API fallback",
                        claim("React", github("API unavailable", "repo-unavailable", "dependency_match", "0.90", "1.00", 0))),
                scenario("older_active_repository", "Two-year-old dependency match with strong authorship",
                        claim("React", github("older repo", "repo-old", "dependency_match", "0.90", "1.00", 730))),
                scenario("three_active_repositories", "Three independent active dependency matches",
                        claim("React",
                                github("active 1", "active-1", "dependency_match", "0.90", "1.00", 0),
                                github("active 2", "active-2", "dependency_match", "0.90", "1.00", 0),
                                github("active 3", "active-3", "dependency_match", "0.90", "1.00", 0))),
                scenario("strong_reviewed_artifact", "Fresh reviewed artifact with 0.95 evidence depth",
                        claim("React", upload("reviewed", "upload-strong", "0.97", "0.95", 0))),
                scenario("five_description_matches", "Five independent description matches",
                        claim("React",
                                github("weak 1", "weak-1", "description_match", "0.60", "0.60", 0),
                                github("weak 2", "weak-2", "description_match", "0.60", "0.60", 0),
                                github("weak 3", "weak-3", "description_match", "0.60", "0.60", 0),
                                github("weak 4", "weak-4", "description_match", "0.60", "0.60", 0),
                                github("weak 5", "weak-5", "description_match", "0.60", "0.60", 0))),
                scenario("duplicate_reviewed_upload", "Same reviewed artifact uploaded twice",
                        claim("React",
                                upload("reviewed original", "same-artifact", "0.97", "0.95", 0),
                                upload("reviewed duplicate", "same-artifact", "0.97", "0.95", 0))),
                scenario("expert_reviewed_portfolio", "Five independent artifacts at 0.95 depth",
                        claim("React",
                                upload("artifact 1", "expert-1", "0.97", "0.95", 0),
                                upload("artifact 2", "expert-2", "0.97", "0.95", 0),
                                upload("artifact 3", "expert-3", "0.97", "0.95", 0),
                                upload("artifact 4", "expert-4", "0.97", "0.95", 0),
                                upload("artifact 5", "expert-5", "0.97", "0.95", 0))),
                scenario("broad_profile_sparse_evidence", "Four claims with evidence on only one",
                        claim("React", github("active repo", "broad-active", "dependency_match", "0.90", "1.00", 0)),
                        claim("Java"), claim("PostgreSQL"), claim("Docker"))
        );
    }

    private ScoringCalibrationHarness.CalibrationScenario scenario(
            String id,
            String description,
            ScoringCalibrationHarness.ClaimSpec... claims
    ) {
        return new ScoringCalibrationHarness.CalibrationScenario(id, description, List.of(claims));
    }

    private ScoringCalibrationHarness.ClaimSpec claim(
            String skill,
            ScoringCalibrationHarness.EvidenceSpec... evidence
    ) {
        return new ScoringCalibrationHarness.ClaimSpec(skill, List.of(evidence));
    }

    private ScoringCalibrationHarness.EvidenceSpec github(
            String label,
            String group,
            String linkType,
            String confidence,
            String authorshipWeight,
            int ageDays
    ) {
        return new ScoringCalibrationHarness.EvidenceSpec(
                label, "github", "repository", "github:" + group, linkType,
                decimal(confidence), null, decimal(authorshipWeight), ageDays);
    }

    private ScoringCalibrationHarness.EvidenceSpec upload(
            String label,
            String group,
            String matchConfidence,
            String evidenceDepth,
            int ageDays
    ) {
        return new ScoringCalibrationHarness.EvidenceSpec(
                label, "manual_upload", "user_uploaded_asset", "upload:" + group,
                "llm_document_match", decimal(matchConfidence), decimal(evidenceDepth),
                BigDecimal.ONE, ageDays);
    }

    private BigDecimal decimal(String value) {
        return new BigDecimal(value);
    }

    private int score(
            Map<String, ScoringCalibrationHarness.CalibrationResult> results,
            String scenarioId
    ) {
        return results.get(scenarioId).overallScore();
    }

    private void logReport(List<ScoringCalibrationHarness.CalibrationResult> results) {
        StringBuilder report = new StringBuilder("\n[SCORING CALIBRATION]\n")
                .append("| Fake user | Overall | Lift | Claim scores | Scenario |\n")
                .append("|---|---:|---:|---|---|\n");
        results.forEach(result -> report
                .append('|').append(result.scenario().id())
                .append('|').append(result.overallScore())
                .append('|').append(result.evidenceDelta())
                .append('|').append(result.claimScores())
                .append('|').append(result.scenario().description())
                .append("|\n"));
        log.info(report.toString());
    }
}
