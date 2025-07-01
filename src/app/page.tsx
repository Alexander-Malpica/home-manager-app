"use client";

import { useEffect, useState } from "react";
import { useAuth, SignIn, SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Image
          src="/logo-home-manager.webp"
          alt="Logo"
          width={80}
          height={80}
          style={{ width: 80, height: 80, objectFit: "contain" }}
          priority
        />
        <Typography variant="h4" fontWeight="bold">
          Home Manager App
        </Typography>
      </Box>

      <Typography color="text.secondary" mb={4}>
        Simplify your home life. One app for chores, bills, shopping, and more.
      </Typography>

      {mode === "sign-in" ? (
        <>
          <SignIn
            routing="hash"
            afterSignInUrl="/dashboard"
            appearance={{
              elements: {
                card: "shadow-none bg-transparent p-0",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                socialButtonsBlockButton:
                  "bg-gray-100 hover:bg-gray-200 text-gray-800",
              },
            }}
          />

          <Typography mt={2} fontSize={14} color="text.secondary">
            New here?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => setMode("sign-up")}
            >
              Sign up
            </Button>
          </Typography>
        </>
      ) : (
        <>
          <SignUp
            routing="hash"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                card: "shadow-none bg-transparent p-0",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                socialButtonsBlockButton:
                  "bg-gray-100 hover:bg-gray-200 text-gray-800",
              },
            }}
          />

          <Typography mt={2} fontSize={14} color="text.secondary">
            Already a member?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => setMode("sign-in")}
            >
              Sign in
            </Button>
          </Typography>
        </>
      )}
    </Box>
  );
}
