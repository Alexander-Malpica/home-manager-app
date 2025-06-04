"use client";

import {
  Box,
  Typography,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddChoreModal from "@/components/modals/AddChoreModal";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth, useUser } from "@clerk/nextjs";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";
import useAuditLog from "@/app/hooks/useAuditLog"; // ✅ Import the hook

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
  const { addLog } = useAuditLog(); // ✅ Get the log method
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    setIsFetching(true);
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
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setIsFetching(false));
  }, [isSignedIn, isLoaded, setItems]);

  const handleAddItem = async (item: Omit<ChoresItem, "id">) => {
    if (editingIndex !== null) {
      const existing = items[editingIndex];
      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      if (isSignedIn && existing.id) {
        await fetch("/api/chores/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

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

      // ✅ Log: chore added
      await addLog({
        action: "Added chore",
        itemType: "chore",
        itemName: savedItem.name,
        userId: user?.id || "unknown",
        userName: user?.firstName || "Unknown",
      });
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = (id: string | undefined) => {
    if (!id) return;

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const updated = [...items];
    updated[index].checked = true;
    setItems(updated);

    const itemToRemove = items[index];

    setTimeout(async () => {
      const filtered = items.filter((item) => item.id !== id);
      setItems(filtered);

      if (isSignedIn && itemToRemove.id) {
        await fetch("/api/chores/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemToRemove.id }),
        });

        // ✅ Log: chore completed
        await addLog({
          action: "Completed chore",
          itemType: "chore",
          itemName: itemToRemove.name,
          userId: user?.id || "unknown",
          userName: user?.firstName || "Unknown",
        });
      }
    }, 500);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "assigned") {
      return (
        item.assignee.toLowerCase() === (user?.firstName?.toLowerCase() ?? "")
      );
    }

    return true;
  });

  const showEmpty = filteredItems.length === 0;

  if (!isLoaded || isFetching) return <LoadingScreen />;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🧹 Chores
      </Typography>

      <Box px={{ xs: 2, sm: 3 }} py={2} mb={2}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="assigned">Assigned to Me</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {showEmpty ? (
        <EmptyState message="No chores yet. Tap + to add one!" />
      ) : (
        <ListPaper
          items={filteredItems}
          onItemClick={(index) => handleItemClick(filteredItems[index].id)}
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

      <FloatingAddButton onClick={() => setModalOpen(true)} />

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
