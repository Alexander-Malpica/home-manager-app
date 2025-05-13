"use client";

import { Box, Typography, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import ListPaper from "@/components/lists/ListPaper";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth } from "@clerk/nextjs";

interface MaintenanceItem {
  id?: string;
  title: string;
  category: string;
  description: string;
  checked?: boolean;
}

export default function MaintenancePage() {
  const [items, setItems] = useLocalStorage<MaintenanceItem[]>(
    "maintenanceItems",
    []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
  }, [isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<MaintenanceItem, "id">) => {
    if (editingIndex !== null) {
      const existing = items[editingIndex];

      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      // Send PATCH to server
      if (isSignedIn && existing.id) {
        await fetch("/api/maintenance/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

    // Add new item
    if (isSignedIn) {
      const res = await fetch("/api/maintenance", {
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
        await fetch("/api/maintenance/delete", {
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
        🛠️ Maintenance
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
              primary={item.title}
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
      <AddMaintenanceModal
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
