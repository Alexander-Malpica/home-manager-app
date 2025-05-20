"use client";

import {
  Box,
  Typography,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddChoreModal from "@/components/modals/AddChoreModal";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth, useUser } from "@clerk/nextjs";
import LoadingScreen from "@/components/LoadingScreen";

interface ChoresItem {
  createdAt?: string | number | Date;
  id?: string;
  name: string;
  assignee: string;
  recurrence: string;
  description: string;
  checked?: boolean;
}

export default function ChoresPage() {
  const [items, setItems] = useLocalStorage<ChoresItem[]>("choresItems", []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "assigned">("all");

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/chores")
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.text();
          console.error("Failed to fetch chores:", error);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
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

  const filteredItems = items.filter((item) => {
    if (filter === "today") {
      if (!item.createdAt) return false; // skip if no date
      const created = new Date(item.createdAt);
      const today = new Date();
      return (
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
      );
    }

    if (filter === "assigned") {
      return (
        item.assignee.toLowerCase() === (user?.firstName?.toLowerCase() ?? "")
      );
    }

    return true;
  });

  if (!isLoaded) return <LoadingScreen />;

  if (!isSignedIn) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          Please sign in to access your chores.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100dvh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🧹 Chores
      </Typography>

      <Box mb={2}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="assigned">Assigned to Me</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredItems.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          No chores in your list.
        </Typography>
      ) : (
        <ListPaper
          items={filteredItems}
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
