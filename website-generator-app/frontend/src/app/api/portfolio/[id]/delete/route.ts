import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
   req: Request,
   context: { params: Promise<{ id: string }> }
) {
    
    // Retrieve portfolio id from url 
    const { id: portfolioId } = await context.params;

   try {
          
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        // If auth error or no user -> error
        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized access!" },
                { status: 401 }
            );
        } 

        // Delete portfolio row if owned by user
        const { error } = await supabase
            .from("portfolios")
            .delete()
            .eq("id", portfolioId)
            .eq("user_id", user.id)


        // Check for error
        if (error) {
            return NextResponse.json(
                { error: "Failed to delete portfolio!" },
                { status: 403 }
            );
        }


        return NextResponse.json({ success: true });
            
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }

}
