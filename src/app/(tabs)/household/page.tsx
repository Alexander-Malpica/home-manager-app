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
  const [householdOwnerId, setHouseholdOwnerId] = useState<string | null>(null);
  const [trueOwnerEmail, setTrueOwnerEmail] = useState<string | null>(null);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const theme = useTheme();

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";
  const isTrueOwner = user?.id === householdOwnerId;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    async function fetchMembers() {
      try {
        const res = await fetch("/api/household/members");

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch household members:", errorText);
          setMembers([]);
          return;
        }

        const data = await res.json();
        setMembers(data.members);
        setHouseholdOwnerId(data.trueOwnerId);
        setTrueOwnerEmail(data.trueOwnerEmail);
      } catch (err) {
        console.error("Error fetching household members:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [isSignedIn, isLoaded]);

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
      setMembers(data);
    }

    setInviting(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    await fetch(`/api/household/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleRemove = async (id: string) => {
    const confirmed = confirm("Are you sure you want to remove this member?");
    if (!confirmed) return;

    await fetch(`/api/household/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, remove: true }),
    });

    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleExit = async (id: string) => {
    const confirmed = confirm("Are you sure you want to leave the household?");
    if (!confirmed) return;

    await fetch(`/api/household/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, remove: true }),
    });

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

      <Grid container spacing={2} alignItems="stretch">
        {members.map((member) => {
          const isMemberTrueOwner = member.userId === householdOwnerId;

          return (
            <Grid item xs={12} md={6} key={member.id}>
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 3,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar>{member.name?.[0]?.toUpperCase() || "?"}</Avatar>

                  <Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography fontWeight="bold">
                        {toPascalCase(
                          member.name || member.invitedEmail || "Unknown"
                        )}
                      </Typography>
                      {isMemberTrueOwner && (
                        <Typography fontSize="1rem" sx={{ color: "#b8860b" }}>
                          👑
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {isMemberTrueOwner
                        ? trueOwnerEmail || member.invitedEmail || "No email"
                        : member.invitedEmail || "No email"}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={member.role}
                    size="small"
                    sx={{
                      bgcolor:
                        member.role === "owner"
                          ? "#b8860b"
                          : theme.palette.mode === "dark"
                          ? theme.palette.grey[800]
                          : theme.palette.grey[200],
                      color: member.role === "owner" ? "#fff" : "inherit",
                      textTransform: "capitalize",
                      fontWeight: 500,
                    }}
                  />
                  <Chip label="active" size="small" color="success" />

                  {isOwner && (
                    <>
                      {/* Only true owner can manage other owners */}
                      {(member.role !== "owner" || isTrueOwner) &&
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
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

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
            onClick={() => handleExit(currentMember.id)}
          >
            Exit Household
          </Button>
        </Box>
      )}
    </Container>
  );
}
