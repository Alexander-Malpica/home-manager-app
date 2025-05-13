"use client";

import { Box, Typography, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import ListPaper from "@/components/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddChoreModal from "@/components/modals/AddChoreModal";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth } from "@clerk/nextjs";

interface ChoresItem {
  id?: string;
  name: string;
  assignee: string;
  description: string;
  checked?: boolean;
}

export default function ChoresPage() {
  const [items, setItems] = useLocalStorage<ChoresItem[]>("choresItems", []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/chores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
  }, [isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<ChoresItem, "id">) => {
    if (editingIndex !== null) {
      const existing = items[editingIndex];

      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      // Send PATCH to server
      if (isSignedIn && existing.id) {
        await fetch("/api/chores/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

    // Add new item
    if (isSignedIn) {
      const res = await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save item: ${errorText}`);
      }

      const savedItem = await res.json();
      setItems((prev) => [...prev, savedItem]);
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = (index: number) => {
    const updated = [...items];
    updated[index].checked = true;
    setItems(updated);

    const itemToRemove = items[index];

    // Remove after delay
    setTimeout(async () => {
      const filtered = items.filter((_, i) => i !== index);
      setItems(filtered);

      if (isSignedIn && itemToRemove.id) {
        await fetch("/api/chores/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemToRemove.id }),
        });
      }
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
              secondary={`Assigned to: ${item.assignee} | Description: ${item.description}`}
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
