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
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
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
    description: string;
  }) => void;
  item?: { title: string; category: string; description: string } | null;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(maintenanceCategories[0]);
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!title || !description) return;
    onSubmit({ title, category, description });
    setTitle("");
    setCategory(maintenanceCategories[0]);
    setDescription("");
    onClose();
  };

  useEffect(() => {
    setTitle(item?.title || "");
    setCategory(item?.category || maintenanceCategories[0]);
    setDescription(item?.description || "");
  }, [item, open]);

  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  return (
    <Box>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={"xs"}
        TransitionComponent={Transition}
      >
        <DialogTitle>Add Maintenance Task</DialogTitle>
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
