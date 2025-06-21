"use client";

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";

function toPascalCase(input: string) {
  return input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const dialogContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 1,
};

interface Member {
  id: string;
  name?: string;
  invitedEmail?: string | null;
  userId?: string | null;
}

export default function AddChoreModal({
  open,
  onClose,
  onSubmit,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: {
    name: string;
    assignee: string;
    recurrence: string;
    description: string;
  }) => void;
  item?: {
    name: string;
    assignee: string;
    recurrence: string;
    description: string;
  } | null;
}) {
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [members, setMembers] = useState<string[]>([]);

  const handleAdd = () => {
    if (!name) return;
    onSubmit({ name, assignee, description, recurrence });
    setName("");
    setAssignee("");
    setDescription("");
    setRecurrence("none");
    onClose();
  };

  useEffect(() => {
    // set form values
    setName(item?.name || "");
    setAssignee(item?.assignee || "");
    setDescription(item?.description || "");
    setRecurrence(item?.recurrence || "none");

    // fetch members
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/household/members");
        if (!res.ok) throw new Error("Failed to load members");

        const data = await res.json();

        const memberList: Member[] = Array.isArray(data.members)
          ? data.members
          : [];
        const names = memberList
          .map((m) => m.name || m.invitedEmail || m.userId || "")
          .filter((name) => !!name);

        setMembers(names);
      } catch (err) {
        console.error("Failed to fetch household members:", err);
      }
    };

    fetchMembers();
  }, [item, open]);

  return (
    <Box>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Chore</DialogTitle>
        <DialogContent sx={dialogContentStyle}>
          <TextField
            label="Chore Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Assigned To"
            select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            {members.map((name) => (
              <MenuItem key={name} value={name}>
                {toPascalCase(name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Recurrence"
            select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="biweekly">BiWeekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>

          <TextField
            label="Description (optional)"
            value={description}
            multiline
            minRows={2}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
