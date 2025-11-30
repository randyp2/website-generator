import { adminSupabase } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";


/**
 * 
 * @param req Query parameter passed through url/path 
 * (i.e. /api/portfolio/list?userId=7913f5f7-a9a1-4688-be20-01a5adc11a4a)
 * @returns HTTP status and/or list of portfolios
 */
export async function GET(req: Request, {}) {

    // Parse the userId from the URL query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate userId
    if (!userId) {
        if (!userId) {
            return NextResponse.json(
                { error: "userId and templateId are required." },
                { status: 400 }
            );
        }
    }

    // ==============================================================
    // FETCH ALL PORTFOLIOS FOR USER 
    // ==============================================================
    try {
        // Fetch all portfolios with matching userId - Sort by created_at descending
        const { data, error } = await adminSupabase
            .from("portfolios")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Portfolio get error:", error);
            return NextResponse.json({ error: "Failed to fetch all portfolios." }, { status: 500 });
        }


        // SUCCESS — return all portfolios belonging to this user
        return NextResponse.json({ portfolios: data });
            
    } catch (err) {
        // Handle unexpected errors
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }
}