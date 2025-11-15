"use server";


import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// -------------------------------------------------------------
// lib/auth-actions.ts
// -------------------------------------------------------------
// This file defines *server actions* for handling authentication
// with Supabase in a Next.js App Router project.
//
// Each function runs exclusively on the server (because of "use server"),
// ensuring sensitive operations like login, signup, and logout are secure.
//
// These functions interact with Supabase Auth using the server client,
// and redirect users based on the result of the operation.
// -------------------------------------------------------------

export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/dashboard-user", "layout");
  redirect("/dashboard-user");
}

export async function signup(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: `${firstName + " " + lastName}`,
        email: formData.get("email") as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data); // Call supabase auth with data 
  
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Server action to sign out user
export async function signout() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient(); // Create supabase client 

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard-user`, // where to redirect to after oauth 
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url); // Redirect to the OAuth URL
  // Once sign in middleware intercepts the redirect call from google OAuth flow, it will handle the rest
}
