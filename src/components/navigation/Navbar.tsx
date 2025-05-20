"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsModal from "../modals/NotificationsModal";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data: Notification[]) => {
        const unread = data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      });
  }, []);

  return (
    <AppBar position="sticky" color="default" elevation={5}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src="/logo-home-manager.webp"
            alt="Logo"
            width={50}
            height={50}
            style={{ width: 50, height: 50, objectFit: "contain" }}
            priority
          />
          <Typography variant="h6" component="div" fontWeight="bold">
            Home Manager App
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* ✅ Notification icon with badge */}

          <IconButton onClick={() => setModalOpen(true)}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <UserButton showName afterSignOutUrl="/" />
        </Box>
      </Toolbar>
      <NotificationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppBar>
  );
}
