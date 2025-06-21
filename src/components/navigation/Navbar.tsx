"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Logout,
  Settings,
  ListAlt,
  // Tune,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "@/theme/ColorModeContext";
import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import NotificationsModal from "../modals/NotificationsModal";
import AuditLogsModal from "../modals/AuditLogModal";
import PreferencesModal from "../modals/PreferencesModal";

interface Notification {
  id: string;
  householdId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const theme = useTheme();
  const colorMode = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const [unreadCount, setUnreadCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const capitalize = (str?: string) =>
    str
      ? str
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      : "";

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

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
          minHeight: "56px !important",
          width: "100%",
          px: 2,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 1 : 0,
        }}
      >
        {/* Logo and Title */}
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

        {/* Actions */}
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

          {user && (
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                borderRadius: 2,
                px: 1,
                py: 0.5,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                },
              }}
            >
              {!isMobile && (
                <Typography variant="body2" fontWeight="medium">
                  {`${capitalize(user.firstName || "")} ${capitalize(
                    user.lastName || ""
                  )}`}
                </Typography>
              )}
              <Avatar
                src={user.imageUrl}
                alt={user.firstName ?? "User"}
                sx={{ width: 32, height: 32 }}
              />
            </Box>
          )}

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, minWidth: 200 },
            }}
          >
            <MenuItem onClick={() => openUserProfile()}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Manage Account
            </MenuItem>

            <MenuItem onClick={() => colorMode.toggleColorMode()}>
              <ListItemIcon>
                {theme.palette.mode === "dark" ? (
                  <Brightness7 fontSize="small" />
                ) : (
                  <Brightness4 fontSize="small" />
                )}
              </ListItemIcon>
              {theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}
            </MenuItem>

            {/* <MenuItem onClick={() => setPreferencesModalOpen(true)}>
              <ListItemIcon>
                <Tune fontSize="small" />
              </ListItemIcon>
              Preferences
            </MenuItem> */}

            <MenuItem onClick={() => setAuditModalOpen(true)}>
              <ListItemIcon>
                <ListAlt fontSize="small" />
              </ListItemIcon>
              Audit Logs
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => signOut()}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <NotificationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AuditLogsModal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />

      <PreferencesModal
        open={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
      />
    </AppBar>
  );
}
