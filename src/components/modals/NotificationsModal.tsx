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
                  <ListItem key={n.id} divider>
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
        <Button
          onClick={async () => {
            await fetch("/api/notifications/clear", { method: "POST" });
            setNotifications([]); // clear UI after deletion
            onClose(); // close modal
          }}
          color="primary"
        >
          Mark All as Read
        </Button>
      </DialogActions>
    </Dialog>
  );
}
