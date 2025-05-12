"use client";

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";

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
    assignedTo: string;
    description: string;
  }) => void;
  item?: { name: string; assignedTo: string; description: string } | null;
}) {
  const [name, setName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!name) return;
    onSubmit({ name, assignedTo, description });
    setName("");
    setAssignedTo("");
    setDescription("");
    onClose();
  };

  useEffect(() => {
    setName(item?.name || "");
    setAssignedTo(item?.assignedTo || "");
    setDescription(item?.description || "");
  }, [item, open]);

  return (
    <Box>
      {/* Modal */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
        <DialogTitle>Add Shopping Item</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Chore Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
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
