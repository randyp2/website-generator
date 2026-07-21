import { describe, expect, it } from "vitest"

import type { ClaimDTO } from "@/types/claim"
import type { VerificationSummaryDTO } from "@/types/verification-summary"

import {
  deriveOverviewFromSummary,
  mapClaimsToSkillVerifications,
} from "./verification.utils"

const claimWithoutEvidence = (confidence: number): ClaimDTO => ({
  id: "claim-1",
  profileId: "profile-1",
  resumeVerificationId: "resume-1",
  claimType: "skill",
  rawValue: "React",
  canonicalSkillId: "skill-1",
  canonicalSkillName: "React",
  source: "resume",
  confidence,
  status: "needs_evidence",
  evidenceSummary: {
    claimId: "claim-1",
    linkedEvidenceCount: 0,
    linkedEvidence: [],
  },
  createdAt: "2026-07-20T00:00:00Z",
  updatedAt: "2026-07-20T00:00:00Z",
})

const summaryAtScore = (overallScore: number): VerificationSummaryDTO => ({
  scoreType: overallScore === 0 ? "initial" : "evidence_enhanced",
  baselineOverallScore: 0,
  evidenceDelta: overallScore,
  overallScore,
  recognitionCoverage: 1,
  evidenceCoverage: overallScore === 0 ? 0 : 1,
  evidenceStrength: overallScore / 100,
  verificationTier: overallScore === 0 ? "self_declared" : "corroborated",
  scoreLabel: "evidence_score",
  totalSkills: 1,
  matchedSkills: 1,
  unmatchedSkills: 0,
  normalizedCoverage: 1,
  sourceQuality: 0.8,
  parserConfidence: 1,
  profileScoreNarrative: null,
  claims: [],
  unverifiedClaims: [],
  suggestedActions: [],
  generatedAt: "2026-07-20T00:00:00Z",
})

describe("zero-based verification score mapping", () => {
  it("does not convert parser confidence into verification points", () => {
    const [skill] = mapClaimsToSkillVerifications([claimWithoutEvidence(1)])

    expect(skill.baselineScore).toBe(0)
    expect(skill.evidenceContribution).toBe(0)
    expect(skill.score).toBe(0)
    expect(skill.tier).toBe("Unverified")
  })

  it.each([
    [0, "Unverified"],
    [20, "Unverified"],
    [21, "Basic"],
    [40, "Basic"],
    [41, "Intermediate"],
    [60, "Intermediate"],
    [61, "Advanced"],
    [80, "Advanced"],
    [81, "Expert"],
    [100, "Expert"],
  ] as const)("maps score %i to the %s tier", (score, expectedTier) => {
    expect(deriveOverviewFromSummary(summaryAtScore(score)).tier).toBe(expectedTier)
  })
})
