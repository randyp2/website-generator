"use client"

import {
  ShieldCheck,
  Link,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import type {
  VerificationEmptyStateProps,
  VerificationErrorStateProps,
} from "./verification.types"

const ONBOARDING_STEPS = [
  {
    icon: Link,
    title: "Connect Your Accounts",
    description:
      "Link your GitHub, LinkedIn, and other platforms to import evidence automatically.",
  },
  {
    icon: FileText,
    title: "Upload Your Resume",
    description:
      "We'll extract skills and cross-reference them against your connected accounts.",
  },
  {
    icon: BarChart3,
    title: "Get Your Verification Score",
    description:
      "See a detailed breakdown of how your claims are backed by real evidence.",
  },
] as const

const VerificationEmptyState = ({ onStart }: VerificationEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <ShieldCheck className="h-16 w-16 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Verify Your Skills
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-10">
        Build trust with employers and collaborators by verifying your skills
        through connected accounts, certifications, and project evidence.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
        {ONBOARDING_STEPS.map((step, index) => (
          <Card key={step.title} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <step.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={onStart} size="lg">
          Start Verification
        </Button>
        <Button variant="ghost" size="lg">
          Learn More
        </Button>
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

export {
  VerificationEmptyState,
  VerificationErrorState,
  VerificationLoadingSkeleton,
  ResumeUploadLoadingSkeleton,
}
