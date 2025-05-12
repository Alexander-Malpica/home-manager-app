"use client";

import ListPaper from "@/components/lists/ListPaper";
import AddBillModal from "@/components/modals/AddBillModal";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import { Box, Typography, ListItemText } from "@mui/material";
import { useState } from "react";

interface BillsItem {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  checked?: boolean;
}

export default function BillsPage() {
  const [items, setItems] = useState<BillsItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddItem = (item: {
    name: string;
    amount: number;
    dueDate: string;
    category: string;
  }) => {
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = item;
      setItems(updated);
      setEditingIndex(null);
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = (index: number) => {
    const updated = [...items];
    updated[index].checked = true;

    setItems(updated);

    // Auto-remove after 1s
    setTimeout(() => {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }, 500);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        💵 Bills
      </Typography>

      {items.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          No bills in your list.
        </Typography>
      ) : (
        <ListPaper
          items={items}
          onItemClick={handleItemClick}
          onEditClick={handleEditClick}
          renderItemText={(item) => (
            <ListItemText
              primary={item.name}
              secondary={`$${item.amount} | Due: ${item.dueDate}`}
              sx={{
                textDecoration: item.checked ? "line-through" : "none",
                color: item.checked ? "gray" : "inherit",
              }}
            />
          )}
        />
      )}

      {/* Add Button */}
      <FloatingAddButton onClick={() => setModalOpen(true)} />

      {/* Modal */}
      <AddBillModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleAddItem}
        item={editingIndex !== null ? items[editingIndex] : null}
      />
    </Box>
  );
}
