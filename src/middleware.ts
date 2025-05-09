// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - static files
     * - public files
     * - API routes (optional)
     * - Clerk routes
     */
    "/((?!api|_next|.*\\..*|sign-in|sign-up|favicon.ico).*)",
  ],
};
