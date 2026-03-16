"use client";

import React, { useState } from "react";
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

const ReviewPage: React.FC = () => {
    const searchParams = useSearchParams();
    const [isEditing, setIsEditing] = useState(false);

    const {
        templateId,
        portfolioId,
        parsedResumeData,
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
        updateExperience,
        updateExperienceBullet,
        addExperienceBullet,
        removeExperienceBullet,
        updateEducation,
    } = usePortfolioStore();

    useReviewPortfolioSync({
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

    return (
        <div className="relative min-h-screen p-10 pb-32">
            <ReviewPageHeader
                isEditing={isEditing}
                onToggleEditing={() => setIsEditing((value) => !value)}
            />

            <div className="max-w-5xl mx-auto">
                {isParsingResume ? (
                    <ResumeShimmerSkeleton />
                ) : parsingError && !parsedResumeData ? (
                    <ReviewStatePanel
                        message={parsingError}
                        detail="You can still continue and enter your information manually on the next page."
                        accentClassName="text-amber-400"
                    />
                ) : !parsedResumeData ? (
                    <ReviewStatePanel message="No resume data available. Please go back and upload a resume." />
                ) : (
                    <>
                        <PersonalInfoSection
                            isEditing={isEditing}
                            parsedResumeData={parsedResumeData}
                            updateFullName={updateFullName}
                            updateEmail={updateEmail}
                            updatePhone={updatePhone}
                            updateLocation={updateLocation}
                            updateSummary={updateSummary}
                        />
                        <SkillsSection
                            isEditing={isEditing}
                            skills={parsedResumeData.skills || []}
                            addSkill={addSkill}
                            updateSkill={updateSkill}
                            removeSkill={removeSkill}
                        />
                        <ExperienceSection
                            experiences={parsedResumeData.experiences || []}
                            isEditing={isEditing}
                            updateExperience={updateExperience}
                            updateExperienceBullet={updateExperienceBullet}
                            addExperienceBullet={addExperienceBullet}
                            removeExperienceBullet={removeExperienceBullet}
                        />
                        <EducationSection
                            educations={parsedResumeData.educations || []}
                            isEditing={isEditing}
                            updateEducation={updateEducation}
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
    );
};

export default ReviewPage;
