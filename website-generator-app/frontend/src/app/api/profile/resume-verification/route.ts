import { getBackendUrl } from "@/lib/server-env";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (response.status === 204) {
            return NextResponse.json(null);
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch resume verification" },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error("Error in resume verification GET route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};

export const DELETE = async () => {
    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl = getBackendUrl();

        // Delete the DB row — response includes bucket/path for storage cleanup
        const response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Backend resume verification delete failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to delete resume verification" },
                { status: response.status },
            );
        }

        const deleted = await response.json();

        // Delete file from storage if bucket/path exist
        if (deleted.rawFileBucket && deleted.rawFilePath) {
            const { error: storageError } = await adminSupabase.storage
                .from(deleted.rawFileBucket)
                .remove([deleted.rawFilePath]);

            if (storageError) {
                console.error(
                    "Failed to delete resume file from storage:",
                    storageError,
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in resume verification DELETE route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
