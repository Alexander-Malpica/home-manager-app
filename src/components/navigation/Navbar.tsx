"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  useMediaQuery,
} from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsModal from "../modals/NotificationsModal";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "@/theme/ColorModeContext";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  householdId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

export default function Navbar() {
  const theme = useTheme();
  const colorMode = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data: Notification[] = await res.json();
        const unread = data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={5}
      sx={{
        top: 0,
        zIndex: theme.zIndex.appBar,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: "56px !important", // Ensures tighter height
          width: "100%",
          px: 2,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 1 : 0,
        }}
      >
        {/* Logo and App Title */}
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src="/logo-home-manager.webp"
            alt="Logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40, objectFit: "contain" }}
            priority
          />
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            Home Manager App
          </Typography>
        </Box>

        {/* Right-side Actions */}
        <Box
          display="flex"
          alignItems="center"
          gap={isMobile ? 1 : 2}
          mt={isMobile ? 1 : 0}
          ml="auto"
        >
          <IconButton onClick={() => setModalOpen(true)}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <UserButton
            showName={!isMobile}
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonBox: {
                  color: theme.palette.mode === "dark" ? "#fff" : "#1A202C",
                },
              },
            }}
          />
        </Box>
      </Toolbar>

      <NotificationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppBar>
  );
}
