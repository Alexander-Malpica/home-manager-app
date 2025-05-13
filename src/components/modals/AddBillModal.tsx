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

const billCategories = ["Utilities", "Rent", "Internet", "Phone", "Other"];

export default function AddBillModal({
  open,
  onClose,
  onSubmit,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (billItem: {
    name: string;
    amount: number;
    dueDate: string;
    category: string;
  }) => void;
  item?: {
    name: string;
    amount: number;
    dueDate: string;
    category: string;
  } | null;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState(billCategories[0]);

  const handleAdd = () => {
    if (!name || !amount) return;
    onSubmit({ name, amount, dueDate, category });
    setName("");
    setAmount(0);
    setDueDate("");
    setCategory(billCategories[0]);
    onClose();
  };

  useEffect(() => {
    setName(item?.name || "");
    setAmount(item?.amount || 0);
    setDueDate(item?.dueDate || "");
    setCategory(item?.category || billCategories[0]);
  }, [item, open]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Modal */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
        <DialogTitle>Add Shopping Item</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Bill Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <TextField
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {billCategories.map((cat) => (
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
