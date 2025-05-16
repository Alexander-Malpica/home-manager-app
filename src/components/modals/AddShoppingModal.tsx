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
const categories = ["Groceries", "Cleaning", "Household", "Other"];

export default function AddShoppingModal({
  open,
  onClose,
  onSubmit,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: { name: string; category: string }) => void;
  item?: { name: string; category: string } | null;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);

  const handleAdd = () => {
    if (!name) return;
    onSubmit({ name, category });
    setName("");
    setCategory(categories[0]);
    onClose();
  };

  useEffect(() => {
    setName(item?.name || "");
    setCategory(item?.category || categories[0]);
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
        <DialogTitle>Add Shopping Item</DialogTitle>
        <DialogContent sx={dialogContentStyle}>
          <TextField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
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
