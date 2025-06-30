"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Member {
  id: string;
  name?: string;
  invitedEmail?: string | null;
  userId?: string | null;
}

interface ChoreItem {
  name: string;
  assignee: string;
  recurrence: string;
  description: string;
}

interface AddChoreModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: ChoreItem) => void;
  item?: ChoreItem | null;
}

const dialogContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 1,
};

const recurrenceOptions = ["none", "weekly", "biweekly", "monthly"];

const toPascalCase = (str: string) =>
  str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export default function AddChoreModal({
  open,
  onClose,
  onSubmit,
  item,
}: AddChoreModalProps) {
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [members, setMembers] = useState<string[]>([]);

  const resetForm = () => {
    setName("");
    setAssignee("");
    setDescription("");
    setRecurrence("none");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name, assignee, description, recurrence });
    resetForm();
    onClose();
  };

  useEffect(() => {
    setName(item?.name || "");
    setAssignee(item?.assignee || "");
    setDescription(item?.description || "");
    setRecurrence(item?.recurrence || "none");

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
          .filter(Boolean);

        setMembers(names);
      } catch (err) {
        console.error("Error fetching household members:", err);
      }
    };

    fetchMembers();
  }, [item, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{item ? "Edit Chore" : "Add Chore"}</DialogTitle>

      <DialogContent sx={dialogContentStyle}>
        <TextField
          label="Chore Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
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
          {recurrenceOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {toPascalCase(option)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {item ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
