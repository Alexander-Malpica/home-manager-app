"use client";

import { Box, Typography, ListItemText } from "@mui/material";
import { useState } from "react";
import AddShoppingModal from "@/components/modals/AddShoppingModal";
import ListPaper from "@/components/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";

interface ShoppingItem {
  name: string;
  category: string;
  checked?: boolean;
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddItem = (item: { name: string; category: string }) => {
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
        🛒 Shopping List
      </Typography>

      {items.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          No items in your list.
        </Typography>
      ) : (
        <ListPaper
          items={items}
          onItemClick={handleItemClick}
          onEditClick={handleEditClick}
          renderItemText={(item) => (
            <ListItemText
              primary={item.name}
              secondary={item.category}
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
      <AddShoppingModal
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
