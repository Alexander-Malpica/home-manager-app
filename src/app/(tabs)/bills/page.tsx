"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  ListItemText,
  Skeleton,
  Box,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useSnackbar, SnackbarKey } from "notistack";
import groupBy from "lodash/groupBy";

import useLocalStorage from "@/app/hooks/useLocalStorage";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";

import ListPaper from "@/components/dashboard/lists/ListPaper";
import AddBillModal from "@/components/modals/AddBillModal";
import FloatingAddButton from "@/components/layout/FloatingAddButton";
import EmptyState from "@/components/shared/EmptyState";
import ListSkeleton from "@/components/shared/SkeletonList";

interface BillsItem {
  id?: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  checked?: boolean;
}

const defaultSnackbar = {
  open: false,
  message: "",
  severity: "success" as "success" | "error",
};

export default function BillsPage() {
  const [items, setItems] = useLocalStorage<BillsItem[]>("billsItems", []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState(defaultSnackbar);
  const [loadingItems, setLoadingItems] = useState(true);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { addLog } = useAuditLog();
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { role, loading: roleLoading } = useMemberRole(user?.id);
  const isGuest = role === "guest";

  // 🔒 Redirect if user not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // 📦 Fetch bill items
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    setLoadingItems(true);
    fetch("/api/bills")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setItems(data))
      .catch((err) => {
        console.error("Unexpected error:", err);
        setSnackbar({
          open: true,
          message: "Failed to load items.",
          severity: "error",
        });
      })
      .finally(() => setLoadingItems(false));
  }, [isLoaded, isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<BillsItem, "id">) => {
    if (isGuest) return;

    const editing = editingIndex !== null;
    const existing = editing ? items[editingIndex] : null;

    if (editing && existing) {
      const updated = [...items];
      updated[editingIndex] = { ...existing, ...item };
      setItems(updated);
      setEditingIndex(null);

      if (existing.id) {
        await fetch("/api/bills/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...item }),
        });

        setSnackbar({
          open: true,
          message: `Item updated: ${item.name}`,
          severity: "success",
        });
      }
    } else {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const savedItem = await res.json();
      setItems((prev) => [...prev, savedItem]);
      setSnackbar({
        open: true,
        message: `Item added: ${item.name}`,
        severity: "success",
      });

      await addLog({
        action: "Added bill",
        itemType: "bill",
        itemName: savedItem.name,
        userId: user?.id || "unknown",
        userName: user?.firstName || "Unknown",
      });
    }
  };

  const handleItemClick = (index: number) => {
    if (isGuest) return;

    const itemToRemove = items[index];
    const deletedId = itemToRemove.id;
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);

    const itemAbortMap: Record<string, boolean> = {};

    const undoAction = (key: SnackbarKey) => (
      <Button
        color="secondary"
        size="small"
        onClick={() => {
          setItems((prev) => {
            const restored = [...prev];
            restored.splice(index, 0, itemToRemove);
            return restored;
          });
          itemAbortMap[deletedId!] = true;
          closeSnackbar(key);
        }}
      >
        Undo
      </Button>
    );

    enqueueSnackbar("Item deleted", {
      variant: "info",
      action: undoAction,
      autoHideDuration: 3500,
      anchorOrigin: { horizontal: "center", vertical: "top" },
    });

    setTimeout(async () => {
      if (deletedId && !itemAbortMap[deletedId]) {
        try {
          const res = await fetch("/api/bills/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deletedId }),
          });

          if (!res.ok) throw new Error("Failed to delete from server");

          await addLog({
            action: "Marked bill as paid",
            itemType: "bill",
            itemName: itemToRemove.name,
            userId: user?.id || "unknown",
            userName: user?.firstName || "Unknown",
          });

          setSnackbar({
            open: true,
            message: `Item permanently deleted: ${itemToRemove.name}`,
            severity: "success",
          });
        } catch (err) {
          console.error(err);
          setSnackbar({
            open: true,
            message: "Server deletion failed.",
            severity: "error",
          });
        }
      }
    }, 4000);
  };

  const handleEditClick = (index: number) => {
    if (isGuest) return;
    setEditingIndex(index);
    setModalOpen(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.droppableId !== destination.droppableId) return;

    const grouped = groupBy(items, "category");
    const categoryItems = grouped[source.droppableId];

    const [moved] = categoryItems.splice(source.index, 1);
    categoryItems.splice(destination.index, 0, moved);

    const reordered = Object.values(grouped).flat();
    setItems(reordered);
  };

  if (!isLoaded || !isSignedIn || roleLoading) return <ListSkeleton />;
  const showEmpty = items.length === 0;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        💵 Bills
      </Typography>

      {loadingItems ? (
        <Box px={2}>
          {[1, 2].map((s) => (
            <Box key={s} mt={3}>
              <Skeleton height={30} width="30%" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} sx={{ my: 1 }} />
              ))}
            </Box>
          ))}
        </Box>
      ) : showEmpty ? (
        <EmptyState message="No bills yet. Tap + to add one!" />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(groupBy(items, "category")).map(
            ([category, groupItems]) => (
              <Box key={category} px={{ xs: 2, sm: 3 }} mt={2} mb={2}>
                <Typography variant="h6" gutterBottom>
                  {category}
                </Typography>

                <Droppable droppableId={category}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      display="flex"
                      flexDirection="column"
                      gap={1}
                    >
                      {groupItems.map((item, index) => {
                        const globalIndex = items.findIndex(
                          (i) => i.id === item.id
                        );
                        return (
                          <Draggable
                            key={item.id || `${category}-${index}`}
                            draggableId={item.id || `${category}-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <ListPaper
                                  items={[item]}
                                  onItemClick={() =>
                                    handleItemClick(globalIndex)
                                  }
                                  onEditClick={() =>
                                    handleEditClick(globalIndex)
                                  }
                                  renderItemText={(item) => (
                                    <ListItemText
                                      primary={item.name}
                                      secondary={`$${item.amount.toFixed(
                                        2
                                      )} • Due: ${new Date(
                                        item.dueDate
                                      ).toLocaleDateString()}`}
                                      primaryTypographyProps={{
                                        sx: {
                                          textDecoration: item.checked
                                            ? "line-through"
                                            : "none",
                                          color: item.checked
                                            ? "gray"
                                            : "inherit",
                                          fontWeight: 500,
                                        },
                                      }}
                                      secondaryTypographyProps={{
                                        sx: {
                                          color: item.checked
                                            ? "lightgray"
                                            : "text.secondary",
                                          fontSize: "0.875rem",
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </Box>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            )
          )}
        </DragDropContext>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
