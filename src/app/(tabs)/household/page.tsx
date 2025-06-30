"use client";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";

interface Member {
  status: string;
  id: string;
  userId: string | null;
  invitedEmail: string | null;
  role: string;
  name?: string;
}

function toPascalCase(input: string) {
  return input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function HouseholdPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [exiting, setExiting] = useState(false);

  const [householdOwnerId, setHouseholdOwnerId] = useState<string | null>(null);
  const [trueOwnerEmail, setTrueOwnerEmail] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<{
    hasInvite: boolean;
    inviteId: string;
    householdName: string;
  } | null>(null);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const theme = useTheme();

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";
  const isTrueOwner = user?.id === householdOwnerId;

  // 🔒 Redirect unauthenticated users
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isLoaded, isSignedIn, router]);

  // 🔄 Fetch members and invite status
  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    const fetchData = async () => {
      try {
        const [membersRes, inviteRes] = await Promise.all([
          fetch("/api/household/members"),
          fetch("/api/household/invite-status"),
        ]);

        if (inviteRes.ok) {
          const inviteData = await inviteRes.json();
          if (inviteData.hasInvite) setInviteStatus(inviteData);
        }

        if (!membersRes.ok) {
          console.error("Failed to fetch household members");
          setMembers([]);
          return;
        }

        const data = await membersRes.json();
        setMembers(Array.isArray(data.members) ? data.members : []);
        setHouseholdOwnerId(data.trueOwnerId);
        setTrueOwnerEmail(data.trueOwnerEmail);
      } catch (err) {
        console.error("Error fetching household data:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn]);

  const handleInvite = async () => {
    if (!email) return;
    setInviting(true);

    const res = await fetch("/api/household/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setEmail("");
      const updated = await fetch("/api/household/members");
      const data = await updated.json();
      setMembers(Array.isArray(data.members) ? data.members : []);
    }

    setInviting(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    await fetch("/api/household/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    await fetch("/api/household/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, remove: true }),
    });

    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleExit = async () => {
    if (exiting || !confirm("Are you sure you want to leave the household?"))
      return;

    setExiting(true);

    try {
      const res = await fetch("/api/household/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeSelf: true }),
      });

      if (res.ok) {
        window.location.href = "/household";
      } else {
        alert("There was a problem leaving the household.");
      }
    } catch (error) {
      console.error("Error exiting household:", error);
      alert("An unexpected error occurred.");
    } finally {
      setExiting(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!inviteStatus) return;

    await fetch("/api/household/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: inviteStatus.inviteId }),
    });

    setInviteStatus(null);
    window.location.reload();
  };

  const handleDeclineInvite = async () => {
    if (!inviteStatus) return;

    await fetch("/api/household/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: inviteStatus.inviteId }),
    });

    setInviteStatus(null);
    window.location.reload();
  };

  if (!isLoaded || !isSignedIn || loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Household Members
      </Typography>

      {/* 🔔 Invite Banner */}
      {inviteStatus && (
        <Box
          mb={4}
          p={2}
          borderRadius={2}
          bgcolor="warning.light"
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={2}
        >
          <Typography>
            You’ve been invited to join household:{" "}
            <strong>{inviteStatus.householdName}</strong>
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAcceptInvite}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeclineInvite}
            >
              Decline
            </Button>
          </Box>
        </Box>
      )}

      {/* 📩 Invite Form */}
      {isOwner && (
        <Box px={{ xs: 2, sm: 3 }} py={2} display="flex" gap={2} mb={3}>
          <TextField
            label="Invite by Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={inviting}
          >
            {inviting ? "Inviting..." : "Invite"}
          </Button>
        </Box>
      )}

      {/* 👥 Members List */}
      <Grid container spacing={2}>
        {members.map((member) => {
          const isMemberTrueOwner = member.userId === householdOwnerId;

          return (
            <Grid item xs={12} md={6} key={member.id}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={2} flex={1}>
                  <Avatar>{member.name?.[0]?.toUpperCase() || "?"}</Avatar>
                  <Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography fontWeight="bold" noWrap>
                        {toPascalCase(member.name || "Unknown")}
                      </Typography>
                      {isMemberTrueOwner && (
                        <Typography fontSize="1rem" sx={{ color: "#b8860b" }}>
                          👑
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {isMemberTrueOwner
                        ? trueOwnerEmail
                        : member.invitedEmail || "No email"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent={{ xs: "center", sm: "flex-end" }}
                  textAlign={{ xs: "center", sm: "right" }}
                  gap={1}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <Chip
                    label={member.role}
                    size="small"
                    sx={{
                      bgcolor:
                        member.role === "owner"
                          ? "#b8860b"
                          : theme.palette.grey[200],
                      color: member.role === "owner" ? "#fff" : "inherit",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                  <Chip
                    label={member.status === "accepted" ? "Active" : "Pending"}
                    size="small"
                    color={member.status === "accepted" ? "success" : "warning"}
                  />
                  {isOwner &&
                    (member.role !== "owner" || isTrueOwner) &&
                    !isMemberTrueOwner && (
                      <>
                        <Select
                          size="small"
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value)
                          }
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="owner">Owner</MenuItem>
                          <MenuItem value="member">Member</MenuItem>
                          <MenuItem value="guest">Guest</MenuItem>
                        </Select>
                        <IconButton
                          onClick={() => handleRemove(member.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* 🚪 Exit Button */}
      {currentMember && user?.id !== householdOwnerId && (
        <Box
          px={{ xs: 2, sm: 3 }}
          py={2}
          mt={4}
          display="flex"
          justifyContent="center"
          sx={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={handleExit}
            disabled={exiting}
          >
            {exiting ? "Exiting..." : "Exit Household"}
          </Button>
        </Box>
      )}
    </Container>
  );
}
