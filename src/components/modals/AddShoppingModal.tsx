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

interface ShoppingItem {
  name: string;
  category: string;
}

interface AddShoppingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: ShoppingItem) => void;
  item?: ShoppingItem | null;
}

const categories = ["Groceries", "Cleaning", "Household", "Other"];
const dialogContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 1,
};

export default function AddShoppingModal({
  open,
  onClose,
  onSubmit,
  item,
}: AddShoppingModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);

  useEffect(() => {
    setName(item?.name || "");
    setCategory(item?.category || categories[0]);
  }, [item, open]);

  const resetForm = () => {
    setName("");
    setCategory(categories[0]);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSubmit({ name: name.trim(), category });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" keepMounted>
      <DialogTitle>
        {item ? "Edit Shopping Item" : "Add Shopping Item"}
      </DialogTitle>
      <DialogContent sx={dialogContentStyle}>
        <TextField
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
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
        <Button onClick={handleSubmit} variant="contained">
          {item ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
