"use client";

import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <AppBar position="sticky" color="default" elevation={5}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src="/logo-home-manager.png" // 🖼️ Make sure you have this in your /public folder
            alt="Home Manager Logo"
            sx={{ width: 50, height: 50 }}
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
