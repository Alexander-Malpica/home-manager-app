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
import { useEffect, useState } from "react";

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

export default function AddMaintenanceModal({
  open,
  onClose,
  onSubmit,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: {
    title: string;
    category: string;
    recurrence: string;
    description: string;
  }) => void;
  item?: {
    title: string;
    category: string;
    recurrence: string;
    description: string;
  } | null;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(maintenanceCategories[0]);
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");

  const handleAdd = () => {
    if (!title || !description) return;
    onSubmit({ title, category, recurrence, description });
    setTitle("");
    setCategory(maintenanceCategories[0]);
    setRecurrence("none");
    setDescription("");
    onClose();
  };

  useEffect(() => {
    setTitle(item?.title || "");
    setCategory(item?.category || maintenanceCategories[0]);
    setRecurrence(item?.recurrence || "none");
    setDescription(item?.description || "");
  }, [item, open]);

  return (
    <Box>
      {/* Modal */}
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={"xs"}
        keepMounted
      >
        <DialogTitle>Add Maintenance</DialogTitle>
        <DialogContent sx={dialogContentStyle}>
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="biweekly">BiWeekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
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
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
