"use client";

import { Typography, ListItemText, Container } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth, useUser } from "@clerk/nextjs";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";

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
  const { user } = useUser();
  const { addLog } = useAuditLog();
  const router = useRouter();
  const { role, loading: roleLoading } = useMemberRole(user?.id);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    fetch("/api/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
  }, [isSignedIn, isLoaded, setItems]);

  const handleAddItem = async (item: Omit<MaintenanceItem, "id">) => {
    if (role === "guest") return;

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

      await addLog({
        action: "Added maintenance",
        itemType: "maintenance",
        itemName: savedItem.title,
        userId: user?.id || "unknown",
        userName: user?.firstName || "Unknown",
      });
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = (index: number) => {
    if (role === "guest") return;

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

        await addLog({
          action: "Completed maintenance",
          itemType: "maintenance",
          itemName: itemToRemove.title,
          userId: user?.id || "unknown",
          userName: user?.firstName || "Unknown",
        });
      }
    }, 500);
  };

  const handleEditClick = (index: number) => {
    if (role === "guest") return;
    setEditingIndex(index);
    setModalOpen(true);
  };

  if (!isLoaded || !isSignedIn || roleLoading) return <LoadingScreen />;

  const showEmpty = items.length === 0;

  return (
    <Container sx={{ py: 4 }}>
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

      {role !== "guest" && (
        <>
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
        </>
      )}
    </Container>
  );
}
