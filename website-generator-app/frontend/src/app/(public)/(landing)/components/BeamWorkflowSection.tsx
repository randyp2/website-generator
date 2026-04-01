"use client";

import React from "react";

import { AnimatedBeamDemo } from "@/components/ui/animated-beam-demo";

export const BeamWorkflowSection: React.FC = () => {
    return (
        <section className="relative bg-muted/35 px-6 py-20 text-foreground dark:bg-background">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <span className="inline-flex rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground/90 dark:text-secondary-foreground/90">
                        LLM-powered workflow
                    </span>
                    <h2 className="mt-5 text-4xl font-bold text-foreground/85 dark:text-foreground/90 md:text-5xl">
                        Build a personalized portfolio from your full content stack
                    </h2>
                    <p className="mt-4 text-muted-foreground dark:text-muted-foreground/90">
                        We leverage modern LLMs to combine your resume, photos, and media
                        files into tailored copy, structure, and design choices for a
                        portfolio that feels uniquely yours.
                    </p>
                </div>
                <AnimatedBeamDemo />
            </div>
        </section>
    );
};
