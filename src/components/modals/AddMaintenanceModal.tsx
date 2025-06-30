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

interface MaintenanceItem {
  title: string;
  category: string;
  recurrence: string;
  description: string;
}

interface AddMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: MaintenanceItem) => void;
  item?: MaintenanceItem | null;
}

const dialogContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 1,
};

const maintenanceCategories = [
  "General",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Garden",
];

const recurrenceOptions = ["none", "weekly", "biweekly", "monthly"];

export default function AddMaintenanceModal({
  open,
  onClose,
  onSubmit,
  item,
}: AddMaintenanceModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(maintenanceCategories[0]);
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");

  const resetForm = () => {
    setTitle("");
    setCategory(maintenanceCategories[0]);
    setDescription("");
    setRecurrence("none");
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;

    onSubmit({ title, category, recurrence, description });
    resetForm();
    onClose();
  };

  useEffect(() => {
    setTitle(item?.title || "");
    setCategory(item?.category || maintenanceCategories[0]);
    setDescription(item?.description || "");
    setRecurrence(item?.recurrence || "none");
  }, [item, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" keepMounted>
      <DialogTitle>{item ? "Edit Maintenance" : "Add Maintenance"}</DialogTitle>
      <DialogContent sx={dialogContentStyle}>
        <TextField
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          sx={{ mt: 1 }}
        />

        <TextField
          label="Category"
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {maintenanceCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
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
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description"
          multiline
          minRows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
