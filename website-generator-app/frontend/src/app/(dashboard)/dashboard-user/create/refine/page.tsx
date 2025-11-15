export const dynamic = "force-dynamic";
export const revalidate = 0;

import AIRefinementPanel from "./AIRefinementPanel";

/**
 * MODULE 3: CREATE PORTFOLIO FLOW - STEP 2: AI REFINEMENT PANEL
 * 
 * Design Goals:
 * - Split-screen: Preview on left, AI chat on right
 * - Chip suggestions for common requests (low barrier to entry)
 * - Real-time preview updates (instant feedback loop)
 * - Natural conversation flow (friendly, not robotic)
 * - Clear "Apply" vs "Try Another" decision points
 */

export default function RefinePage() {
    return (
        <AIRefinementPanel />
    );
};


