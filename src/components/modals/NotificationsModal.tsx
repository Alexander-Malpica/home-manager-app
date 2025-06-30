"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Box,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import groupBy from "lodash/groupBy";

interface Notification {
  id: string;
  householdId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsModal({
  open,
  onClose,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to load notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [open]);

  const groupedNotifications = groupBy(notifications, "type");

  const handleNotificationClick = async (id: string) => {
    try {
      await fetch("/api/notifications/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "POST" });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onClose();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notifications</DialogTitle>
      <DialogContent>
        {notifications.length === 0 ? (
          <Typography>No notifications yet.</Typography>
        ) : (
          Object.entries(groupedNotifications).map(([type, group]) => (
            <Box key={type} mb={2}>
              <Typography variant="h6" gutterBottom>
                {type.toUpperCase()}
              </Typography>
              <List>
                {group.map((n) => (
                  <ListItem
                    key={n.id}
                    divider
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                    onClick={() => handleNotificationClick(n.id)}
                  >
                    <ListItemText primary={n.title} secondary={n.body} />
                    {!n.read && (
                      <Chip label="Unread" size="small" color="primary" />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </DialogContent>
      {notifications.length > 0 && (
        <DialogActions>
          <Button onClick={handleMarkAllAsRead} color="primary">
            Mark All as Read
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
