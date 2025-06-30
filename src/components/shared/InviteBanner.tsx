"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

interface InviteStatus {
  hasInvite: boolean;
  householdName: string;
  inviteId: string;
}

interface InviteBannerProps {
  onAccepted: () => void;
}

export default function InviteBanner({ onAccepted }: InviteBannerProps) {
  const [invite, setInvite] = useState<InviteStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await fetch("/api/household/invite-status");
        if (!res.ok) return;

        const data: InviteStatus = await res.json();
        if (data.hasInvite) setInvite(data);
      } catch (error) {
        console.error("Failed to fetch invite status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, []);

  const handleAccept = async () => {
    if (!invite) return;

    await fetch("/api/household/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: invite.inviteId }),
    });

    onAccepted();
  };

  const handleDecline = async () => {
    if (!invite) return;

    await fetch("/api/household/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: invite.inviteId }),
    });

    setInvite(null); // Hide banner
  };

  if (loading || !invite) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        mb: 3,
        p: 2,
        borderLeft: "5px solid #f44336",
        backgroundColor: "#fff8f8",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1">
          You’ve been invited to join <strong>{invite.householdName}</strong>
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" color="primary" onClick={handleAccept}>
            Accept
          </Button>
          <Button variant="outlined" color="error" onClick={handleDecline}>
            Decline
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
