"use client";

import { Box, Typography, ListItemText, Container } from "@mui/material";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import AddShoppingModal from "@/components/modals/AddShoppingModal";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import LoadingScreen from "@/components/LoadingScreen";
import groupBy from "lodash/groupBy";
import { useRouter } from "next/navigation";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";

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

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { addLog } = useAuditLog();
  const { role, loading: roleLoading } = useMemberRole(user?.id);
  const router = useRouter();

  const isGuest = role === "guest";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    fetch("/api/shopping")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setItems(data))
      .catch((err) => console.error("Unexpected error:", err));
  }, [isSignedIn, isLoaded, setItems]);

  const handleAddItem = async (item: Omit<ShoppingItem, "id">) => {
    if (isGuest) return;

    if (editingIndex !== null) {
      const existing = items[editingIndex];
      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      if (isSignedIn && existing.id) {
        await fetch("/api/shopping/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

    if (isSignedIn) {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const savedItem = await res.json();
      setItems((prev) => [...prev, savedItem]);

      await addLog({
        action: "Added item",
        itemType: "shopping",
        itemName: savedItem.name,
        userId: user?.id || "unknown",
        userName: user?.firstName || "Unknown",
      });
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = async (index: number) => {
    if (isGuest) return;

    const updated = [...items];
    updated[index].checked = true;
    setItems(updated);

    const itemToRemove = items[index];

    setTimeout(async () => {
      const filtered = items.filter((_, i) => i !== index);
      setItems(filtered);

      if (isSignedIn && itemToRemove.id) {
        await fetch("/api/shopping/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemToRemove.id }),
        });

        await addLog({
          action: "Completed item",
          itemType: "shopping",
          itemName: itemToRemove.name,
          userId: user?.id || "unknown",
          userName: user?.firstName || "Unknown",
        });
      }
    }, 500);
  };

  const handleEditClick = (index: number) => {
    if (isGuest) return;

    setEditingIndex(index);
    setModalOpen(true);
  };

  if (!isLoaded || !isSignedIn || roleLoading) return <LoadingScreen />;
  const showEmpty = items.length === 0;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🛒 Shopping List
      </Typography>

      {showEmpty ? (
        <EmptyState message="No shopping items yet. Tap + to add one!" />
      ) : (
        Object.entries(groupBy(items, "category")).map(
          ([category, groupItems]) => (
            <Box px={{ xs: 2, sm: 3 }} mt={2} mb={2} key={category}>
              <Typography variant="h6" gutterBottom>
                {category}
              </Typography>

              <ListPaper
                items={groupItems}
                onItemClick={(index) => {
                  if (!isGuest) {
                    const globalIndex = items.findIndex(
                      (i) => i.id === groupItems[index].id
                    );
                    handleItemClick(globalIndex);
                  }
                }}
                onEditClick={(index) => {
                  if (!isGuest) {
                    const globalIndex = items.findIndex(
                      (i) => i.id === groupItems[index].id
                    );
                    handleEditClick(globalIndex);
                  }
                }}
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
            </Box>
          )
        )
      )}

      {!isGuest && <FloatingAddButton onClick={() => setModalOpen(true)} />}

      <AddShoppingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingIndex(null);
        }}
        onSubmit={handleAddItem}
        item={editingIndex !== null ? items[editingIndex] : null}
      />
    </Container>
  );
}
