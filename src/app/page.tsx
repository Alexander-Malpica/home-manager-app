"use client";

import { useEffect } from "react";
import { useAuth, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

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
      flexDirection={"column"}
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Image
          src="/logo-home-manager.webp"
          alt="Logo"
          width={80}
          height={80}
          style={{ width: "80px", height: "80px", objectFit: "contain" }}
          priority
        />
        <Typography variant="h4" component="div" fontWeight="bold">
          Home Manager App
        </Typography>
      </Box>
      <Typography color="text.secondary" mb={5}>
        Simplify your home life. One app for chores, bills, shopping, and more.
      </Typography>

      <SignIn
        routing="hash"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "shadow-none bg-transparent p-0",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            socialButtonsBlockButton:
              "bg-gray-100 hover:bg-gray-200 text-gray-800",
          },
        }}
      />
    </Box>
  );
}
