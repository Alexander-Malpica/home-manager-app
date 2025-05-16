"use client";

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
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
    description: string;
  }) => void;
  item?: { name: string; assignee: string; description: string } | null;
}) {
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!name) return;
    onSubmit({ name, assignee, description });
    setName("");
    setAssignee("");
    setDescription("");
    onClose();
  };

  useEffect(() => {
    setName(item?.name || "");
    setAssignee(item?.assignee || "");
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
        maxWidth="xs"
        TransitionComponent={Transition}
      >
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
