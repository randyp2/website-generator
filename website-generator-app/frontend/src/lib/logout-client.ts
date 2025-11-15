"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";


export async function signoutClient() {
    const supabase = await createClient();

    // Sign out the user
    await supabase.auth.signOut();
    
    // CANNOT REDIRECT FROM CLIENT ONLY ON SERVER

}