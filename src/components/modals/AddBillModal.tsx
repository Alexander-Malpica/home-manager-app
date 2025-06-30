"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

const billCategories = ["Utilities", "Rent", "Internet", "Phone", "Other"];

interface BillItem {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
}

interface AddBillModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (billItem: BillItem) => void;
  item?: BillItem | null;
}

export default function AddBillModal({
  open,
  onClose,
  onSubmit,
  item,
}: AddBillModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string | number>("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState(billCategories[0]);

  useEffect(() => {
    setName(item?.name || "");
    setAmount(item?.amount?.toString() || "");
    setDueDate(item?.dueDate || "");
    setCategory(item?.category || billCategories[0]);
  }, [item, open]);

  const handleAdd = () => {
    const numericAmount = Number(amount);
    if (!name || amount === "" || isNaN(numericAmount)) return;

    onSubmit({ name, amount: numericAmount, dueDate, category });

    // Reset fields and close dialog
    setName("");
    setAmount("");
    setDueDate("");
    setCategory(billCategories[0]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{item ? "Edit Bill" : "Add Bill"}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Bill Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          sx={{ mt: 1 }}
        />
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
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
          {item ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
