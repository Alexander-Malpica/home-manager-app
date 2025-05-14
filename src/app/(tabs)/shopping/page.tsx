"use client";

import { Box, Typography, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs"; // 🔄 START: import Clerk auth
import AddShoppingModal from "@/components/modals/AddShoppingModal";
import ListPaper from "@/components/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import useLocalStorage from "@/app/hooks/useLocalStorage";

interface ShoppingItem {
  id?: string;
  name: string;
  category: string;
  checked?: boolean;
}

export default function ShoppingPage() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>(
    "shoppingItems",
    []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { isSignedIn } = useAuth();

  // Fetch items from API if signed in
  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/shopping")
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to fetch items");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched items:", data); // ✅ Add this
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error("Unexpected error:", err));
  }, [isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<ShoppingItem, "id">) => {
    if (editingIndex !== null) {
      const existing = items[editingIndex];

      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      // Send PATCH to server
      if (isSignedIn && existing.id) {
        await fetch("/api/shopping/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

    // Add new item
    if (isSignedIn) {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const savedItem = await res.json();
      setItems((prev) => [...prev, savedItem]);
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = async (index: number) => {
    const updated = [...items];
    updated[index].checked = true;
    setItems(updated);

    const itemToRemove = items[index];

    // Remove after delay
    setTimeout(async () => {
      const filtered = items.filter((_, i) => i !== index);
      setItems(filtered);

      if (isSignedIn && itemToRemove.id) {
        await fetch("/api/shopping/delete", {
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
    <Box sx={{ p: 3, minHeight: "100dvh" }}>
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
