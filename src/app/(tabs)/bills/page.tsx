"use client";

import useLocalStorage from "@/app/hooks/useLocalStorage";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import LoadingScreen from "@/components/LoadingScreen";
import AddBillModal from "@/components/modals/AddBillModal";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import { useAuth, useUser } from "@clerk/nextjs";
import { Typography, ListItemText, Container } from "@mui/material";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";

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
  const [isFetching, setIsFetching] = useState(false);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { addLog } = useAuditLog();
  const router = useRouter();

  const { role, loading: roleLoading } = useMemberRole(user?.id);
  const isGuest = role === "guest";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    setIsFetching(true);
    fetch("/api/bills")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setIsFetching(false));
  }, [isLoaded, isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<BillsItem, "id">) => {
    if (isGuest) return;

    if (editingIndex !== null) {
      const existing = items[editingIndex];
      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      if (isSignedIn && existing.id) {
        await fetch("/api/bills/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });
      }

      return;
    }

    if (isSignedIn) {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const savedItem = await res.json();
      setItems((prev) => [...prev, savedItem]);

      await addLog({
        action: "Added bill",
        itemType: "bill",
        itemName: savedItem.name,
        userId: user?.id || "unknown",
        userName: user?.firstName || "Unknown",
      });
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  const handleItemClick = (index: number) => {
    if (isGuest) return;

    const updated = [...items];
    updated[index].checked = true;
    setItems(updated);

    const itemToRemove = items[index];

    setTimeout(async () => {
      const filtered = items.filter((_, i) => i !== index);
      setItems(filtered);

      if (isSignedIn && itemToRemove.id) {
        await fetch("/api/bills/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemToRemove.id }),
        });

        await addLog({
          action: "Marked bill as paid",
          itemType: "bill",
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

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [items]);

  if (!isLoaded || isFetching || roleLoading) return <LoadingScreen />;

  const showEmpty = items.length === 0;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        💵 Bills
      </Typography>

      {showEmpty ? (
        <EmptyState message="No bills yet. Tap + to add one!" />
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

      {!isGuest && <FloatingAddButton onClick={() => setModalOpen(true)} />}

      <AddBillModal
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
