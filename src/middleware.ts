// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // ✅ Match everything except static/public files and Clerk auth routes
    "/((?!_next|.*\\..*|sign-in|sign-up|favicon.ico).*)",
  ],
};
