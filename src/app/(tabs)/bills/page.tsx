"use client";

import useLocalStorage from "@/app/hooks/useLocalStorage";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import LoadingScreen from "@/components/LoadingScreen";
import AddBillModal from "@/components/modals/AddBillModal";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography, ListItemText } from "@mui/material";
import { useEffect, useState, useMemo } from "react";

interface BillsItem {
  id?: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  checked?: boolean;
}

export default function BillsPage() {
  const [items, setItems] = useLocalStorage<BillsItem[]>("billsItems", []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/bills")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
  }, [isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<BillsItem, "id">) => {
    if (editingIndex !== null) {
      const existing = items[editingIndex];

      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      // Send PATCH to server
      if (isSignedIn && existing.id) {
        await fetch("/api/bills/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

    // Add new item
    if (isSignedIn) {
      const res = await fetch("/api/bills", {
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
        await fetch("/api/bills/delete", {
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

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [items]);

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Box sx={{ p: 3, minHeight: "100dvh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        💵 Bills
      </Typography>

      {items.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          No bills in your list.
        </Typography>
      ) : (
        <ListPaper
          items={sortedItems}
          onItemClick={handleItemClick}
          onEditClick={handleEditClick}
          renderItemText={(item) => (
            <ListItemText
              primary={item.name}
              secondary={`$${item.amount} | Due: ${item.dueDate}`}
              sx={{
                textDecoration: item.checked ? "line-through" : "none",
                color: item.checked
                  ? "gray"
                  : new Date(item.dueDate) < new Date()
                  ? "red"
                  : "inherit",
                fontWeight:
                  !item.checked && new Date(item.dueDate) < new Date()
                    ? "bold"
                    : "normal",
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
