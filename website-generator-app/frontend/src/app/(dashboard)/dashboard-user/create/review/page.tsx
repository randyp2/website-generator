"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EducationSection } from "./components/EducationSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { ReviewContinueButton } from "./components/ReviewContinueButton";
import { ReviewPageHeader } from "./components/ReviewPageHeader";
import { ReviewStatePanel } from "./components/ReviewStatePanel";
import { ResumeShimmerSkeleton } from "./components/ResumeShimmerSkeleton";
import { SkillsSection } from "./components/SkillsSection";
import { useReviewContinue } from "./hooks/useReviewContinue";
import { useReviewPortfolioSync } from "./hooks/useReviewPortfolioSync";
import { useReviewToasts } from "./hooks/useReviewToasts";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { MANUAL_RESUME_SOURCE_KEY } from "@/utils/resume/manualResumeTemplate";

const ReviewPageContent: React.FC = () => {
    const searchParams = useSearchParams();
    const [isEditing, setIsEditing] = useState(false);

    const {
        templateId,
        portfolioId,
        parsedResumeData,
        parsedResumeSourceKey,
        isParsingResume,
        parsingError,
        setTemplateId,
        setPortfolioId,
        setParsedResumeData,
        setParsedResumeSourceKey,
        setIsParsingResume,
        setParsingError,
        updateFullName,
        updateEmail,
        updatePhone,
        updateLocation,
        updateSummary,
        addSkill,
        updateSkill,
        removeSkill,
        addExperience,
        removeExperience,
        updateExperience,
        updateExperienceBullet,
        addExperienceBullet,
        removeExperienceBullet,
        updateEducation,
    } = usePortfolioStore();

    useReviewPortfolioSync({
        isParsingResume,
        portfolioId,
        parsedResumeData,
        searchPortfolioId: searchParams.get("portfolioId"),
        setPortfolioId,
        setParsedResumeData,
        setParsedResumeSourceKey,
        setTemplateId,
        setIsParsingResume,
        setParsingError,
        templateId,
    });

    useReviewToasts({
        isParsingResume,
        parsedResumeData,
        parsingError,
        portfolioId,
    });

    const { handleContinue } = useReviewContinue({
        parsedResumeData,
        portfolioId,
    });
    const isManualTemplate =
        parsedResumeSourceKey === MANUAL_RESUME_SOURCE_KEY ||
        parsedResumeData?.parsingMethod === "manual_template";

    const effectiveIsEditing = isManualTemplate || isEditing;

    return (
        <div className="relative min-h-screen px-3 py-8 text-white sm:px-4 lg:px-6">
            <div className="relative">
            <ReviewPageHeader
                isEditing={effectiveIsEditing}
                onToggleEditing={() => setIsEditing((value) => !value)}
            />

            <div className="mx-auto max-w-6xl">
                {isParsingResume ? (
                    <ResumeShimmerSkeleton />
                ) : parsingError && !parsedResumeData ? (
                    <ReviewStatePanel
                        message={parsingError}
                        detail="You can still continue and enter your information manually on the next page."
                        accentClassName="text-amber-400"
                    />
                ) : !parsedResumeData ? (
                    <ResumeShimmerSkeleton />
                ) : (
                    <>
                        <PersonalInfoSection
                            isEditing={effectiveIsEditing}
                            parsedResumeData={parsedResumeData}
                            updateFullName={updateFullName}
                            updateEmail={updateEmail}
                            updatePhone={updatePhone}
                            updateLocation={updateLocation}
                            updateSummary={updateSummary}
                        />
                        <EducationSection
                            educations={parsedResumeData.educations || []}
                            isEditing={effectiveIsEditing}
                            updateEducation={updateEducation}
                        />
                        <SkillsSection
                            isEditing={effectiveIsEditing}
                            skills={parsedResumeData.skills || []}
                            addSkill={addSkill}
                            updateSkill={updateSkill}
                            removeSkill={removeSkill}
                        />
                        <ExperienceSection
                            experiences={parsedResumeData.experiences || []}
                            isEditing={effectiveIsEditing}
                            addExperience={addExperience}
                            removeExperience={removeExperience}
                            updateExperience={updateExperience}
                            updateExperienceBullet={updateExperienceBullet}
                            addExperienceBullet={addExperienceBullet}
                            removeExperienceBullet={removeExperienceBullet}
                        />
                    </>
                )}
            </div>

            <ReviewContinueButton
                disabled={isParsingResume}
                onClick={() => {
                    void handleContinue();
                }}
            />
            </div>
        </div>
    );
};

const ReviewPage: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <ReviewPageContent />
        </Suspense>
    );
};

export default ReviewPage;
