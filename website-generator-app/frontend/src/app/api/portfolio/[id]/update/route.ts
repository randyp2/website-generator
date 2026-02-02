import { adminSupabase } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";


type UpdatePortfolioBody = {
    title?: string;
    last_step?: string;
    template_id?: string;
};

export const PATCH = async (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => {

    const { id: portfolioId } = await context.params;

    const body = (await req.json()) as UpdatePortfolioBody | null;
    const title = typeof body?.title === "string" ? body.title : undefined;
    const lastStep = typeof body?.last_step === "string" ? body.last_step : undefined;
    const templateId = typeof body?.template_id === "string" ? body.template_id : undefined;

    try {
        const { data, error } = await adminSupabase
            .from("portfolios")
            .update({
                ...(title && { title }),
                ...(lastStep && { last_step: lastStep }),
                ...(templateId && { template_id: templateId }),
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
};
