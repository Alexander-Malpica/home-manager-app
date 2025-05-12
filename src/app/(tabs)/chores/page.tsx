"use client";

import { Box, Typography, ListItemText } from "@mui/material";
import { useState } from "react";
import ListPaper from "@/components/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddChoreModal from "@/components/modals/AddChoreModal";

interface Chores {
  name: string;
  assignedTo: string;
  description: string;
  checked?: boolean;
}

export default function ChoresPage() {
  const [items, setItems] = useState<Chores[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddItem = (item: {
    name: string;
    assignedTo: string;
    description: string;
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
        🧹 Chores
      </Typography>

      {items.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          No chores in your list.
        </Typography>
      ) : (
        <ListPaper
          items={items}
          onItemClick={handleItemClick}
          onEditClick={handleEditClick}
          renderItemText={(item) => (
            <ListItemText
              primary={item.name}
              secondary={`Assigned to: ${item.assignedTo} | Description: ${item.description}`}
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
      <AddChoreModal
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
