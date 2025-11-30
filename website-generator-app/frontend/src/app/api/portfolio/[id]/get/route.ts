import { adminSupabase } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    
    const { id: portfolioId } = await context.params;


    try {
        // Fetch portfolio row from supabase
        const { data: portfolio, error: pError } = await adminSupabase
            .from("portfolios")
            .select("*")
            .eq("id", portfolioId)
            .single();
        
        if (pError) {
            console.error("Portfolio get error:", pError);
            return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
        }

        // Fetch resume file metadata
        const { data: resume, error: resumeError } = await adminSupabase
            .from("resumes")
            .select("*")
            .eq("portfolio_id", portfolioId)
            .single();

        // Fetch media + video assets
        const { data: assets, error: aError } = await adminSupabase
            .from("assets")
            .select("*")
            .eq("portfolio_id", portfolioId);


        return NextResponse.json({
            portfolio,
            resume: resume ?? null,
            assets: assets ?? [],
        });

    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }

}