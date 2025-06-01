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

export default function NotificationsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data));
  }, [open]);

  const grouped = groupBy(notifications, "type");

  const handleNotificationClick = async (id: string) => {
    await fetch("/api/notifications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = async () => {
    await fetch("/api/notifications/clear", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notifications</DialogTitle>
      <DialogContent>
        {notifications.length === 0 ? (
          <Typography>No notifications yet.</Typography>
        ) : (
          Object.entries(grouped).map(([type, group]) => (
            <Box key={type} mb={2}>
              <Typography variant="h6" gutterBottom>
                {type.toUpperCase()}
              </Typography>
              <List>
                {group.map((n) => (
                  <ListItem
                    key={n.id}
                    divider
                    component="div"
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
      <DialogActions>
        <Button onClick={handleMarkAllAsRead} color="primary">
          Mark All as Read
        </Button>
      </DialogActions>
    </Dialog>
  );
}
