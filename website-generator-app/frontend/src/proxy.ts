import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'


// Runs everytime request is being made 
// Call supabase's helper function (updateSession)
// Valid or refresh users JWT Tokens if expired
export async function proxy(request: NextRequest) {

  // Pass incoming request to updateSession
  return await updateSession(request)
}

/**
 * Hooks into Next.js’s request pipeline (Edge Runtime).
 *  Calls your updateSession() helper on every page request (except excluded paths).
 *  Ensures Supabase sessions (JWT tokens) are refreshed, valid, and synced automatically.
 */


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - branding (logo and site icon assets)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|branding).*)',
  ],
}
