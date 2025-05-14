"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!hasHydrated || !isLoaded) return null; // Prevent premature rendering

  return (
    <main className="flex h-full min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg text-center flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl font-bold">🏠 Home Manager App</h1>
        <p className="text-md text-gray-600">
          Simplify your home life. One app for chores, bills, shopping, and
          more.
        </p>

        <div>
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                card: "shadow-lg bg-white rounded-lg p-6",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                socialButtonsBlockButton:
                  "bg-gray-100 hover:bg-gray-200 text-gray-800",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
