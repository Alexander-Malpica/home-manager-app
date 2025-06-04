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
import React, { useEffect, useState } from "react";

const dialogContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 1,
};

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
  const [amount, setAmount] = useState<string | number>("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState(billCategories[0]);

  const handleAdd = () => {
    const numericAmount = Number(amount);
    if (!name || amount === "" || isNaN(numericAmount)) return;
    onSubmit({ name, amount: numericAmount, dueDate, category });
    setName("");
    setAmount("");
    setDueDate("");
    setCategory(billCategories[0]);
    onClose();
  };

  useEffect(() => {
    setName(item?.name || "");
    setAmount(item?.amount?.toString() || "");
    setDueDate(item?.dueDate || "");
    setCategory(item?.category || billCategories[0]);
  }, [item, open]);

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Bill</DialogTitle>
        <DialogContent sx={dialogContentStyle}>
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
            onChange={(e) => {
              const val = e.target.value;
              setAmount(val === "" ? "" : Number(val));
            }}
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
