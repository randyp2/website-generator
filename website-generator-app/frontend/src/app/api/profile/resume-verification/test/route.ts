import { getBackendUrlOrNull } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const backendUrl: string | null = getBackendUrlOrNull();
    const res: Response = await fetch(
        `${backendUrl}/api/v1/profile/resume-verification/upload/test`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        },
    );

    if (!res.ok)
        return NextResponse.json(
            { error: "Backend failed :(" },
            { status: 500 },
        );

    return NextResponse.json({ message: "IT WORKED :D" }, { status: 200 });
};
