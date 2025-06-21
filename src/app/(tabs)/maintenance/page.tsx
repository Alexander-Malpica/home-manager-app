"use client";

import {
  Typography,
  ListItemText,
  Container,
  Snackbar,
  Alert,
  Box,
  Skeleton,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/navigation/FloatingAddButton";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";
import ListSkeleton from "@/components/loaders/SkeletonList";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useSnackbar, SnackbarKey } from "notistack";
import groupBy from "lodash/groupBy";

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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [loadingItems, setLoadingItems] = useState(true);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { addLog } = useAuditLog();
  const router = useRouter();
  const { role, loading: roleLoading } = useMemberRole(user?.id);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isGuest = role === "guest";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    setLoadingItems(true);
    fetch("/api/maintenance")
      .then((res) => (res.ok ? res.json() : []))
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
        setSnackbar({
          open: true,
          message: "Item updated.",
          severity: "success",
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
      setSnackbar({ open: true, message: "Item added.", severity: "success" });

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
    if (isGuest) return;

    const itemToRemove = items[index];
    const deletedId = itemToRemove.id;

    // Optimistically update the UI
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);

    const action = (key: SnackbarKey) => (
      <Button
        color="secondary"
        size="small"
        onClick={() => {
          setItems((prev) => {
            const restored = [...prev];
            restored.splice(index, 0, itemToRemove);
            return restored;
          });

          closeSnackbar(key);
          // Mark the item as not to delete
          itemAbortMap[deletedId!] = true;
        }}
      >
        Undo
      </Button>
    );

    // Keep track if undo was clicked
    const itemAbortMap: Record<string, boolean> = {};

    enqueueSnackbar("Item deleted", {
      variant: "info",
      action,
      autoHideDuration: 3500,
      anchorOrigin: { horizontal: "center", vertical: "top" },
    });

    setTimeout(async () => {
      if (deletedId && !itemAbortMap[deletedId]) {
        try {
          const res = await fetch("/api/maintenance/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: itemToRemove.id }),
          });

          if (!res.ok) {
            throw new Error("Failed to delete from server");
          }

          await addLog({
            action: "Completed maintenance",
            itemType: "maintenance",
            itemName: itemToRemove.title,
            userId: user?.id || "unknown",
            userName: user?.firstName || "Unknown",
          });

          setSnackbar({
            open: true,
            message: "Item permanently deleted.",
            severity: "success",
          });
        } catch (error) {
          console.error(error);
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
    if (role === "guest") return;
    setEditingIndex(index);
    setModalOpen(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCategory = source.droppableId;
    const destCategory = destination.droppableId;

    // Prevent dragging across categories
    if (sourceCategory !== destCategory) return;

    const grouped = groupBy(items, "category");
    const categoryItems = grouped[sourceCategory];

    const [moved] = categoryItems.splice(source.index, 1);
    categoryItems.splice(destination.index, 0, moved);

    // Flatten back into full items array maintaining other categories
    const newItems: MaintenanceItem[] = [];
    for (const key of Object.keys(grouped)) {
      newItems.push(...grouped[key]);
    }

    setItems(newItems);
  };

  if (!isLoaded || !isSignedIn || roleLoading) return <ListSkeleton />;

  const showEmpty = items.length === 0;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🛠️ Maintenance
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
        <EmptyState message="No maintenance tasks yet. Tap + to add one!" />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(groupBy(items, "category")).map(
            ([category, groupItems]) => (
              <Box px={{ xs: 2, sm: 3 }} mt={2} mb={2} key={category}>
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
                                      primary={item.title}
                                      secondary={`Description: ${item.description}`}
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
