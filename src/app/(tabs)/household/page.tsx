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
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import DeleteIcon from "@mui/icons-material/Delete";

interface Member {
  id: string;
  userId: string | null;
  invitedEmail: string | null;
  role: string;
  name?: string;
}

export default function HouseholdPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const { user } = useUser();

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";

  useEffect(() => {
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
        setMembers(data);
      } catch (err) {
        console.error("Error fetching household members:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

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

  return (
    <Container sx={{ py: 4, minHeight: "100dvh" }}>
      <Typography variant="h4" gutterBottom>
        Household Members
      </Typography>

      {isOwner && (
        <Box display="flex" gap={2} mb={3}>
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

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} alignItems="stretch">
            {members.map((member) => (
              <Grid item xs={12} md={6} key={member.id}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: 120,
                    height: "100%",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {member.userId
                        ? `Name: ${member.name ?? member.userId}`
                        : `Invited: ${member.invitedEmail}`}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">Role:</Typography>

                      {member.userId === user?.id && member.role === "owner" ? (
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            border: "1px solid #ccc",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: "#f5f5f5",
                          }}
                        >
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Typography>
                      ) : isOwner ? (
                        <>
                          <Select
                            size="small"
                            value={member.role.toLowerCase()}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value)
                            }
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
                      ) : (
                        <Typography variant="body2">
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Exit button for non-owners */}
          {!isOwner && currentMember && (
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleExit(currentMember.id)}
              >
                Exit Household
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
