"use client";

import { Box, Typography, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth } from "@clerk/nextjs";
import LoadingScreen from "@/components/LoadingScreen";

interface MaintenanceItem {
  id?: string;
  title: string;
  category: string;
  description: string;
  recurrence: string;
  checked?: boolean;
}

export default function MaintenancePage() {
  const [items, setItems] = useLocalStorage<MaintenanceItem[]>(
    "maintenanceItems",
    []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { isSignedIn, isLoaded } = useAuth();

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

      if (isSignedIn && existing.id) {
        await fetch("/api/maintenance/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

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

  if (!isLoaded) return <LoadingScreen />;

  const showEmpty = items.length === 0;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🛠️ Maintenance
      </Typography>

      {showEmpty ? (
        <EmptyState message="No maintenance tasks yet. Tap + to add one!" />
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

      <FloatingAddButton onClick={() => setModalOpen(true)} />

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
