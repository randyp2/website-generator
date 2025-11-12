import { createBrowserClient } from '@supabase/ssr'

// utils/supabase/client.ts
// -------------------------------------------------------------
// This file creates a Supabase client that runs *in the browser*.
// It's used by client-side React components (e.g., login forms).
// Supabase automatically manages the user's session via localStorage.
// -------------------------------------------------------------

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    {

      auth: {
        persistSession: true, // Stores session in local storage (user stays signed in on refresh)
        autoRefreshToken: true, // Renew JWT when it expires
        detectSessionInUrl: true, // helpful for OAuth redirects
      },
    }
  )
}