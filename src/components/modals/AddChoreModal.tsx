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

const dialogContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 1,
};

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
    setName(item?.name || "");
    setAssignee(item?.assignee || "");
    setDescription(item?.description || "");
    setRecurrence(item?.recurrence || "none");
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
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
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
