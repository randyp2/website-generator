"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { UploadedFile } from "@/types/file";
import type { SectionDTO } from "@/types/portfolio";
import { Message, SectionPlan } from "@/types/preview";
import { Preview } from "./components/Preview";
import { FloatingPromptBar } from "./components/FloatingPromptBar";
import { ChatHistoryOverlay } from "./components/ChatHistoryOverlay";
import { SidebarChatPanel } from "./components/SidebarChatPanel";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { downloadPortfolioHtml } from "@/utils/downloadHtml";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AIRefinementPage: React.FC = () => {
    const searchParams = useSearchParams();

    // Zustand store - All portfolio creation state
    const {
        portfolioId,
        templateId,
        setTemplateId,
        parsedResumeData,
        stylePreferences,
        aiPrompt,
        sections,
        setSections,
        setPortfolioId,
        globalTheme,
        setGlobalTheme,
        messages,
        setMessages,
        mediaFiles,
        videoFiles,
        addMediaFiles,
        addVideoFiles,
        removeMediaFile,
        removeVideoFile,
        chatLayoutMode,
        setChatLayoutMode,
    } = usePortfolioStore();

    // Messages & AI response
    const [isGenerating, setIsGenerating] = useState(false);
    const [isHydrating, setIsHydrating] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<SectionPlan[] | null>(null);
    const [isPlanApproved, setIsPlanApproved] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const hasGeneratedRef = useRef(false);
    const lastLoadedIdRef = useRef<string | null>(null);
    // Combine media and video files for display
    const uploadedFiles = [...mediaFiles, ...videoFiles];
    const normalizedMessages = useMemo(
        () =>
            messages.map((message) => ({
                ...message,
                timestamp:
                    message.timestamp instanceof Date
                        ? message.timestamp
                        : new Date(message.timestamp),
            })),
        [messages],
    );

    // ========================================================================
    // LOAD EXISTING PORTFOLIO (RESUME SESSION)
    // ========================================================================
    useEffect(() => {
        const portfolioIdParam = searchParams.get("portfolioId");
        if (!portfolioIdParam) return;
        if (lastLoadedIdRef.current === portfolioIdParam) return;
        lastLoadedIdRef.current = portfolioIdParam;
        if (portfolioId === portfolioIdParam && sections && sections.length > 0) {
            return;
        }
        // Reset chat when switching to a new portfolio to avoid stale messages.
        if (portfolioId !== portfolioIdParam) {
            setMessages([]);
        }
        fetch(`/api/portfolio/${portfolioIdParam}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "refine" }),
        }).catch(() => null);

        const loadPortfolio = async () => {
            setIsHydrating(true);
            try {
                const response = await fetch(
                    `/api/portfolio/${portfolioIdParam}/load`,
                );
                const data = await response.json();

                if (!response.ok) {
                    console.error("Load portfolio error:", data);
                    return;
                }

                setPortfolioId(portfolioIdParam);
                setTemplateId(data?.templateId ?? null);
                setSections(Array.isArray(data?.sections) ? data.sections : []);
                setGlobalTheme(data?.globalTheme ?? null);
            } catch (error) {
                console.error("Failed to load portfolio:", error);
            } finally {
                setIsHydrating(false);
            }
        };

        loadPortfolio();
    }, [
        searchParams,
        portfolioId,
        sections,
        setPortfolioId,
        setTemplateId,
        setSections,
        setGlobalTheme,
        setMessages,
    ]);

    // ========================================================================
    // ONE-SHOT GENERATION PREVIEW
    // ========================================================================
    useEffect(() => {
        const generate = async () => {
            if (hasGeneratedRef.current) return;
            if (sections && sections.length > 0) {
                hasGeneratedRef.current = true;
                return;
            }
            if (!portfolioId || !parsedResumeData) return;
            console.log("GENERATING...");

            hasGeneratedRef.current = true;

            // Add user's prompt to chat
            const basePrompt =
                aiPrompt ||
                "Generate a visually appealing one-shot portfolio that reflects the parsed resume data and style preferences.";

            const userMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: basePrompt,
                timestamp: new Date(),
            };

            // Add temporary AI message with loading indicator
            const tempAiMessage: Message = {
                id: `ai-temp-${Date.now()}`,
                role: "ai",
                content: "", // Empty content, will render status component
                timestamp: new Date(),
                isGenerating: true, // Flag to trigger status component
            };

            setMessages([userMessage, tempAiMessage]);

            // Helper function to load saved portfolio data (recovery mechanism)
            const loadSavedPortfolio = async (): Promise<boolean> => {
                try {
                    console.log("[generate] Attempting to load saved portfolio data...");
                    const loadResponse = await fetch(`/api/portfolio/${portfolioId}/load`);
                    if (!loadResponse.ok) return false;

                    const loadedData = await loadResponse.json();
                    if (loadedData?.sections?.length > 0) {
                        console.log("[generate] Successfully recovered portfolio with", loadedData.sections.length, "sections");
                        setSections(loadedData.sections);
                        if (loadedData?.globalTheme) {
                            setGlobalTheme(loadedData.globalTheme);
                        }
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            };

            try {
                const response: Response = await fetch(
                    `/api/portfolio/${portfolioId}/generate`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            templateId,
                            resume: parsedResumeData,
                            userPrompt: basePrompt,
                            stylePrefs: stylePreferences,
                        }),
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Generate API error:", errorData);
                    // Remove the temporary loading message
                    setMessages((prev) =>
                        prev.filter((m) => m.id !== tempAiMessage.id),
                    );
                    return;
                }

                const data = await response.json();
                setSections(data?.sections ?? null);

                // Set global theme if present in response
                if (data?.globalTheme) {
                    setGlobalTheme(data.globalTheme);
                }

                const assistantMessage = data?.assistantMessage ?? null;
                const summary = assistantMessage?.summary ?? "";
                const suggestions = assistantMessage?.suggestions ?? [];
                const formattedSuggestions = Array.isArray(suggestions)
                    ? suggestions.map((item: string) => `• ${item}`).join("\n")
                    : "";

                const content = [summary, formattedSuggestions]
                    .filter(Boolean)
                    .join("\n")
                    .trim() || "Portfolio generated.";

                const aiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    role: "ai",
                    content,
                    timestamp: new Date(),
                    isGenerating: false, // Not generating anymore
                };

                // Replace temp message with actual response
                setMessages((prev) =>
                    prev.filter((m) => m.id !== tempAiMessage.id).concat(aiMessage),
                );
            } catch (fetchError) {
                // Browser connection likely timed out, but server may have completed
                console.error("[generate] Fetch failed:", fetchError);
                console.log("[generate] Waiting 3s then attempting recovery...");

                // Wait a moment for server to finish saving
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Try to recover by loading the saved portfolio
                const recovered = await loadSavedPortfolio();

                if (recovered) {
                    const recoveryMessage: Message = {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: "Portfolio generated successfully! (Connection timed out but data was recovered.)",
                        timestamp: new Date(),
                        isGenerating: false,
                    };
                    setMessages((prev) =>
                        prev.filter((m) => m.id !== tempAiMessage.id).concat(recoveryMessage),
                    );
                } else {
                    // Complete failure
                    const errorMessage: Message = {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: "Generation timed out and could not recover. Please try again.",
                        timestamp: new Date(),
                        isGenerating: false,
                    };
                    setMessages((prev) =>
                        prev.filter((m) => m.id !== tempAiMessage.id).concat(errorMessage),
                    );
                }
            }
        };

        generate();
    }, [
        portfolioId,
        parsedResumeData,
        templateId,
        aiPrompt,
        stylePreferences,
        sections,
        setMessages,
        setSections,
        setGlobalTheme,
    ]);

    // ========================================================================
    // FILE HANDLING
    // ========================================================================
    /**
     * Processes selected files and adds them to the uploadedFiles state.
     * Validates that files are either images or videos before creating preview URLs.
     *
     * @param files - FileList from input element or drag & drop event
     *
     * Process:
     * 1. Checks if files exist, returns early if null
     * 2. Iterates through each file and validates MIME type
     * 3. Creates object URL for preview display
     * 4. Generates random ID for each file
     * 5. Populates FilePreview object with file metadata and preview data
     * 6. Appends validated files to existing uploadedFiles state
     */
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach((file) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (!isImage && !isVideo) return; // Skip unsupported file types

            const newUploadedFile: UploadedFile = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                title: "",
                description: "",
            };

            if (isImage) addMediaFiles([newUploadedFile]);
            else if (isVideo) addVideoFiles([newUploadedFile]);
        });
    };

    /**
     * Removes a file from the Zustand store by its index.
     * Determines if the file is a media file (image) or video file, then calls the appropriate remove function.
     *
     * @param index - Index of the file to remove in the combined uploadedFiles array
     */
    const removeFile = (index: number) => {
        // Check if it's within mediaFiles range
        if (index < mediaFiles.length) {
            removeMediaFile(index);
        } else {
            // It's a video file, adjust index to videoFiles array
            const videoIndex = index - mediaFiles.length;
            removeVideoFile(videoIndex);
        }
    };

    const summarizeSection = (section: SectionDTO) => {
        let summary = "";
        if (section.contentJson) {
            try {
                summary = JSON.stringify(section.contentJson);
            } catch {
                summary = "";
            }
        }
        if (!summary && section.reactSource) summary = section.reactSource;
        if (!summary && section.title) summary = section.title;
        if (!summary) summary = section.sectionKey;
        return summary.length > 500 ? `${summary.slice(0, 500)}...` : summary;
    };

    const buildSectionSummaries = (items: SectionDTO[] | null) =>
        (items ?? []).map((section) => ({
            sectionKey: section.sectionKey,
            title: section.title ?? "",
            orderIndex: section.orderIndex ?? null,
            summary: summarizeSection(section),
        }));

    // Build full section content for planner/builder
    const buildSectionContent = (items: SectionDTO[] | null) =>
        (items ?? []).map((section) => ({
            sectionKey: section.sectionKey,
            title: section.title ?? "",
            orderIndex: section.orderIndex ?? 0,
            reactSource: section.reactSource ?? "",
            contentJson: section.contentJson ?? {},
        }));

    // ========================================================================
    // PLANNER API CALL
    // ========================================================================
    const callPlanner = async (): Promise<{
        planSummary: string;
        sectionPlans: SectionPlan[];
    } | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sections: buildSectionContent(sections),
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error?.error ?? "Plan request failed");
        }

        return response.json();
    };

    // ========================================================================
    // BUILDER API CALL
    // ========================================================================
    const callBuilder = async (
        sectionPlans: SectionPlan[],
    ): Promise<{
        buildSummary: string;
        modifiedSections: SectionDTO[];
        globalTheme?: import("@/types/portfolio").GlobalTheme | null;
    } | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/build`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sections: buildSectionContent(sections),
                sectionPlans,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error?.error ?? "Build request failed");
        }

        return response.json();
    };

    // ========================================================================
    // APPROVE PLAN & BUILD
    // ========================================================================
    const approvePlanAndBuild = async () => {
        if (!currentPlan || currentPlan.length === 0) return;

        setIsGenerating(true);

        // Add building message
        const buildingMessage: Message = {
            id: `ai-building-${Date.now()}`,
            role: "ai",
            content: "Building your refined portfolio...",
            timestamp: new Date(),
            isGenerating: true,
            messageType: "build",
        };
        setMessages((prev) => [...prev, buildingMessage]);

        try {
            const buildResult = await callBuilder(currentPlan);

            if (buildResult?.modifiedSections) {
                // Update sections with new content
                const updatedSections = buildResult.modifiedSections.map((mod) => ({
                    sectionKey: mod.sectionKey,
                    title: mod.title,
                    reactSource: mod.reactSource,
                    contentJson: mod.contentJson,
                    orderIndex:
                        mod.orderIndex ??
                        sections?.find((s) => s.sectionKey === mod.sectionKey)?.orderIndex ??
                        0,
                })) as SectionDTO[];

                setSections(updatedSections);
            }

            // Update global theme if builder returned one (theme change)
            if (buildResult?.globalTheme) {
                setGlobalTheme(buildResult.globalTheme);
            }

            // Replace building message with completion
            const completeMessage: Message = {
                id: `ai-complete-${Date.now()}`,
                role: "ai",
                content: buildResult?.buildSummary ?? "Portfolio updated successfully!",
                timestamp: new Date(),
                messageType: "build",
            };

            setMessages((prev) =>
                prev.filter((m) => m.id !== buildingMessage.id).concat(completeMessage),
            );

            // Clear the current plan
            setCurrentPlan(null);
        } catch (error) {
            console.error("Build error:", error);
            setIsPlanApproved(false);
            const errorMessage: Message = {
                id: `ai-error-${Date.now()}`,
                role: "ai",
                content: "Sorry, there was an error building your changes. Please try again.",
                timestamp: new Date(),
                messageType: "error",
            };
            setMessages((prev) =>
                prev.filter((m) => m.id !== buildingMessage.id).concat(errorMessage),
            );
        } finally {
            setIsGenerating(false);
            setIsPlanApproved(false);
        }
    };

    const handleApprovePlan = async () => {
        setIsPlanApproved(true);
        await sendMessage("approve", []);
    };

    const handleKeepChatting = () => {
        setIsPlanApproved(false);
        setCurrentPlan(null);
    };

    // ========================================================================
    // VERSION ACTIVATED HANDLER
    // ========================================================================
    const handleVersionActivated = async () => {
        if (!portfolioId) return;

        try {
            const response = await fetch(`/api/portfolio/${portfolioId}/load`);
            const data = await response.json();

            if (response.ok) {
                setSections(Array.isArray(data?.sections) ? data.sections : []);
                if (data?.globalTheme) {
                    setGlobalTheme(data.globalTheme);
                }
            }
        } catch (error) {
            console.error("Failed to reload portfolio after version change:", error);
        }
    };

    // ========================================================================
    // DOWNLOAD HTML
    // ========================================================================
    const handleDownloadHtml = async () => {
        if (!portfolioId || !sections || sections.length === 0) {
            throw new Error("No portfolio to download");
        }

        setIsDownloading(true);
        try {
            await downloadPortfolioHtml(
                portfolioId,
                sections,
                globalTheme,
                "My Portfolio"
            );
        } finally {
            setIsDownloading(false);
        }
    };

    // ========================================================================
    // SEND MESSAGE
    // ========================================================================
    /**
     * Sends a message to the AI and handles the complete message lifecycle.
     *
     * @param prompt - User's text prompt
     * @param files - Array of File objects attached to the message
     *
     * Flow:
     * 1. Validates that either prompt or files exist
     * 2. Creates user message object with timestamp
     * 3. Adds user message to messages array
     * 4. Resets input state (prompt text, uploaded files, upload box)
     * 5. Sets generating state for loading UI
     * 6. Calls Spring Boot backend API to generate portfolio refinement
     * 7. Updates preview HTML with AI-generated content
     * 8. Creates AI message and displays it in both chat drawer and overlay
     * 9. Resets generating state
     */
    const sendMessage = async (prompt: string, files: File[]) => {
        // Validate input
        if (!prompt.trim() && files.length === 0) return;

        // Check if user is approving a plan
        const isApproval = prompt.trim().toLowerCase() === "approve" && currentPlan;
        if (isApproval) {
            // Add user approval message
            const approvalMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: "approve",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, approvalMessage]);

            // Trigger build
            await approvePlanAndBuild();
            return;
        }

        if (!portfolioId) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content:
                    "Please create a portfolio first so I can refine its sections.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            return;
        }

        // Create user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: prompt,
            timestamp: new Date(),
        };

        const tempAiMessage: Message = {
            id: `ai-temp-${Date.now()}`,
            role: "ai",
            content: "",
            timestamp: new Date(),
            isGenerating: true,
        };

        // Add user message to chat history
        setMessages((prev) => [...prev, userMessage, tempAiMessage]);

        // Clear uploaded files from Zustand store
        // Note: We need to clear both mediaFiles and videoFiles
        while (mediaFiles.length > 0) {
            removeMediaFile(0);
        }
        while (videoFiles.length > 0) {
            removeVideoFile(0);
        }

        // Set loading state
        setIsGenerating(true);

        // Clear any existing plan since user is starting new clarification
        if (currentPlan) {
            setCurrentPlan(null);
        }

        try {
            // ============================================================
            // BACKEND CALL: Clarifier API via Next.js route
            // ============================================================
            // Endpoint: POST /api/portfolio/refine/clarify
            //
            // Request Body (JSON):
            // - portfolioId: string
            // - userPrompt: string
            // - sections: SectionSummaryDTO[]
            // ============================================================
            const response = await fetch(
                `/api/portfolio/${portfolioId}/refine/clarify`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userPrompt: prompt,
                        sections: buildSectionSummaries(sections),
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ?? "Clarification request failed.",
                );
            }

            const aiResponseText =
                data?.assistantMessage ??
                "Thanks! I can help clarify that. What would you like to change?";

            const isReadyForPlanning = data?.readyForPlanning === true;

            // Create clarifier response message
            const clarifyMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: aiResponseText,
                timestamp: new Date(),
                messageType: "clarify",
                readyForPlanning: isReadyForPlanning,
            };

            setMessages((prev) =>
                prev.filter((m) => m.id !== tempAiMessage.id).concat(clarifyMessage),
            );

            // If ready for planning, automatically call planner
            if (isReadyForPlanning) {
                const planningMessage: Message = {
                    id: `ai-planning-${Date.now()}`,
                    role: "ai",
                    content: "Creating a modification plan...",
                    timestamp: new Date(),
                    isGenerating: true,
                    messageType: "plan",
                };
                setMessages((prev) => [...prev, planningMessage]);

                try {
                    const planResult = await callPlanner();

                    if (planResult?.sectionPlans) {
                        setCurrentPlan(planResult.sectionPlans);
                        setIsPlanApproved(false);

                        // Format plan for display
                        const planDetails = planResult.sectionPlans
                            .filter((p) => p.action === "modify" || p.action === "add")
                            .map((p) => `• ${p.sectionKey}: ${p.instruction}`)
                            .join("\n");

                        const planContent = `${planResult.planSummary}\n\n**Planned Changes:**\n${planDetails}\n\n_Use the buttons below to apply these changes, or keep chatting to adjust._`;

                        const planMessage: Message = {
                            id: `ai-plan-${Date.now()}`,
                            role: "ai",
                            content: planContent,
                            timestamp: new Date(),
                            messageType: "plan",
                            sectionPlans: planResult.sectionPlans,
                            planSummary: planResult.planSummary,
                        };

                        setMessages((prev) =>
                            prev.filter((m) => m.id !== planningMessage.id).concat(planMessage),
                        );
                    }
                } catch (planError) {
                    console.error("Planning error:", planError);
                    const errorMsg: Message = {
                        id: `ai-error-${Date.now()}`,
                        role: "ai",
                        content: "Sorry, there was an error creating the plan. Please try again.",
                        timestamp: new Date(),
                        messageType: "error",
                    };
                    setMessages((prev) =>
                        prev.filter((m) => m.id !== planningMessage.id).concat(errorMsg),
                    );
                }
            }
        } catch (error) {
            console.error("Error sending message to AI:", error);

            // Show error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content:
                    "Sorry, there was an error processing your request. Please try again.",
                timestamp: new Date(),
            };

            setMessages((prev) =>
                prev
                    .filter((m) => m.id !== tempAiMessage.id)
                    .concat(errorMessage),
            );
        } finally {
            // Reset loading state
            setIsGenerating(false);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="h-screen flex flex-col overflow-hidden relative">
            {/* ================================================ */}
            {/* LAYER 1: SANDBOX - FULL SCREEN (BASE, z-0) */}
            {/* ================================================ */}
            <Preview
                sections={sections}
                globalTheme={globalTheme}
                layoutMode={chatLayoutMode}
                onLayoutModeChange={setChatLayoutMode}
                sidebarContent={
                    chatLayoutMode === 'sidebar' ? (
                        <SidebarChatPanel
                            messages={normalizedMessages}
                            isGenerating={isGenerating || isHydrating}
                            uploadedFiles={uploadedFiles}
                            onSendMessage={sendMessage}
                            onFileSelect={handleFileSelect}
                            onRemoveFile={removeFile}
                            showPlanActions={Boolean(currentPlan) && !isPlanApproved}
                            onApprovePlan={handleApprovePlan}
                            onKeepChatting={handleKeepChatting}
                            portfolioId={portfolioId}
                            onVersionActivated={handleVersionActivated}
                            onDownload={handleDownloadHtml}
                            isDownloading={isDownloading}
                            layoutMode={chatLayoutMode}
                            onLayoutModeChange={setChatLayoutMode}
                        />
                    ) : null
                }
            />

            {/* ================================================ */}
            {/* LAYER 2: CHAT HISTORY OVERLAY - CENTER (z-40) */}
            {/* Only visible in floating mode */}
            {/* ================================================ */}
            {chatLayoutMode === 'floating' && (
                <ChatHistoryOverlay
                    messages={normalizedMessages}
                    isGenerating={isGenerating || isHydrating}
                />
            )}

            {/* ================================================ */}
            {/* LAYER 3: FLOATING PROMPT BAR - BOTTOM (z-50) */}
            {/* Only visible in floating mode */}
            {/* ================================================ */}
            {chatLayoutMode === 'floating' && (
                <FloatingPromptBar
                    uploadedFiles={uploadedFiles}
                    onSendMessage={sendMessage}
                    onFileSelect={handleFileSelect}
                    onRemoveFile={removeFile}
                    isGenerating={isGenerating || isHydrating}
                    showPlanActions={Boolean(currentPlan) && !isPlanApproved}
                    onApprovePlan={handleApprovePlan}
                    onKeepChatting={handleKeepChatting}
                    portfolioId={portfolioId}
                    onVersionActivated={handleVersionActivated}
                    onDownload={handleDownloadHtml}
                    isDownloading={isDownloading}
                    layoutMode={chatLayoutMode}
                    onLayoutModeChange={setChatLayoutMode}
                />
            )}

            {/* Preview mode: no chat UI rendered */}
        </div>
    );
};

export default AIRefinementPage;
