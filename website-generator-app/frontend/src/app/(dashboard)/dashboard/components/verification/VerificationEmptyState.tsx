"use client"

import {
  ShieldCheck,
  FileText,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import type {
  VerificationErrorStateProps,
} from "./verification.types"

const VerificationEmptyState = () => {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] w-full items-center justify-center">
      <div className="mx-auto w-full max-w-3xl text-center">
        <div className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Skill Verification</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          This subtab is your evidence workspace. It compares resume claims
          against connected-source signals, then shows what is verified, what
          still needs evidence, and why each score moved.
        </p>

        <div className="mx-auto mt-6 grid max-w-2xl gap-4 text-left md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              What you will see here
            </p>
            <p className="text-xs text-muted-foreground">
              Claim-by-claim status, linked evidence, score impact, and action
              suggestions.
            </p>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              Why this tab exists
            </p>
            <p className="text-xs text-muted-foreground">
              It turns resume claims into transparent, evidence-backed signals
              that are easier for reviewers to trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const VerificationErrorState = ({
  onRetry,
}: VerificationErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        We couldn&apos;t load your verification data. Please try again.
      </p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  )
}

const VerificationLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Overview skeleton */}
      <div className="flex gap-6 items-center">
        <Skeleton className="h-28 w-28 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-36" />
            <Skeleton className="h-20 w-36" />
            <Skeleton className="h-20 w-36" />
            <Skeleton className="h-20 w-36" />
          </div>
        </div>
      </div>

      {/* Connections skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>

      {/* Leaderboard skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

const ResumeUploadLoadingSkeleton = () => (
  <div className="flex min-h-[calc(100vh-10rem)]">
    {/* Left — intro skeleton */}
    <div className="flex flex-1 flex-col justify-center pr-10">
      <div className="border-l-2 border-border pl-5 mb-8">
        <Skeleton className="h-7 w-52 mb-3" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-4/5 mb-1.5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      <Skeleton className="h-3 w-20 mb-4" />

      <div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-5 border-b border-border py-4 last:border-0">
            <Skeleton className="h-3 w-5 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div className="w-px shrink-0 bg-border" />

    {/* Right — upload area skeleton */}
    <div className="flex flex-1 flex-col items-center justify-center pl-10">
      <Skeleton className="h-28 w-28 rounded-full mb-6" />
      <Skeleton className="h-6 w-44 mb-2" />
      <Skeleton className="h-4 w-64 mb-10" />
      <Skeleton className="h-48 w-full max-w-lg rounded-xl" />
    </div>
  </div>
)

const VerificationLoadingSpinner = () => (
  <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading verification...</p>
    </div>
  </div>
)

export {
  VerificationEmptyState,
  VerificationErrorState,
  VerificationLoadingSkeleton,
  ResumeUploadLoadingSkeleton,
  VerificationLoadingSpinner,
}
