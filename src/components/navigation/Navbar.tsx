"use client";

import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          Logo
          <Typography variant="h6" component="div" fontWeight="bold">
            HomeManager App
          </Typography>
        </Box>

        <Box>
          <UserButton showName afterSignOutUrl="/" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
