import { adminSupabase } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";


export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {

    const { id: portfolioId } = await context.params;

    const body = await req.json();
    const { title } = body;

    try {
        const { data, error } = await adminSupabase
            .from("portfolios")
            .update({
                ...(title && {title}), // Update title if truthy | Don't add if falsy
                updated_at: new Date().toISOString(),
            })
            .eq("id", portfolioId)
            .select()
            .single();

        if (error) {
            console.error("Update portfolio error:", error);
            return NextResponse.json(
                { error: "Failed to update portfolio" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }
}