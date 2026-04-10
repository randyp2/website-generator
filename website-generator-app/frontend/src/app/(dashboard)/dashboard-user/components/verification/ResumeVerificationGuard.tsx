"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import type { ResumeFile } from "./verification.types"
import ResumePreviewCard from "./ResumePreviewCard"
import ResumeUploadGate from "./ResumeUploadGate"

type VerificationSubTab = "resume-review" | "skill-verification"

interface ResumeVerificationGuardProps {
  children: React.ReactNode
}

const ResumeVerificationGuard = ({
  children,
}: ResumeVerificationGuardProps) => {
  const [resume, setResume] = useState<ResumeFile | null>(null)
  const [activeTab, setActiveTab] = useState<VerificationSubTab>("resume-review")

  useEffect(() => {
    return () => {
      if (resume?.url) {
        URL.revokeObjectURL(resume.url)
      }
    }
  }, [resume])

  const handleResumeUploaded = (file: ResumeFile) => {
    if (resume?.url) {
      URL.revokeObjectURL(resume.url)
    }

    setResume(file)
    setActiveTab("resume-review")
  }

  const handleResumeRemoved = () => {
    if (resume?.url) {
      URL.revokeObjectURL(resume.url)
    }

    setResume(null)
    setActiveTab("resume-review")
  }

  if (!resume) {
    return <ResumeUploadGate onResumeUploaded={handleResumeUploaded} />
  }

  return (
    <div className="space-y-8">
      {activeTab === "skill-verification" ? (
        <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
          {[
            { id: "resume-review", label: "Resume Review" },
            { id: "skill-verification", label: "Skill Verification" },
          ].map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as VerificationSubTab)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      ) : null}

      {activeTab === "resume-review" ? (
        <div className="space-y-8">
          <ResumePreviewCard resume={resume} onRemove={handleResumeRemoved} />

          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Resume ready for verification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review the uploaded file, then continue to open the skill
                  verification workspace and evidence preview.
                </p>
              </div>
              <Button onClick={() => setActiveTab("skill-verification")}>
                Continue to Skill Verification
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "skill-verification" ? children : null}
    </div>
  )
}

export default ResumeVerificationGuard
