"use client";

import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

export default function Navbar() {
  return (
    <AppBar position="sticky" color="default" elevation={5}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src="/logo-home-manager.webp"
            alt="Logo"
            width={50}
            height={50}
            style={{ width: "50px", height: "50px", objectFit: "contain" }}
            priority
          />
          <Typography variant="h6" component="div" fontWeight="bold">
            Home Manager App
          </Typography>
        </Box>

        <Box>
          <UserButton showName afterSignOutUrl="/" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
