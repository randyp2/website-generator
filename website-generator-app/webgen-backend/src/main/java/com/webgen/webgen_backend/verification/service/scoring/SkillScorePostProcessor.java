package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;

/**
 * Extension seam for optional post-deterministic score adjustments.
 *
 * Processors run after the deterministic kernel result is produced. This keeps
 * deterministic scoring as the system of record while allowing future bounded
 * overlays, such as additional rubric-based adjustments.
 */
public interface SkillScorePostProcessor {

    /**
     * Applies one post-processing pass to the current summary.
     *
     * Implementations must be deterministic for identical inputs and should
     * preserve auditable behavior.
     *
     * @param currentSummary current summary from deterministic kernel or prior processor
     * @param request original score request context
     * @return updated summary; return currentSummary when no change is needed
     */
    SkillScoreSummary apply(SkillScoreSummary currentSummary, SkillScoreRequest request);
}
