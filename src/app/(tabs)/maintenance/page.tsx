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
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useSnackbar, SnackbarKey } from "notistack";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import groupBy from "lodash/groupBy";

import useLocalStorage from "@/app/hooks/useLocalStorage";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";

import EmptyState from "@/components/shared/EmptyState";
import ListSkeleton from "@/components/shared/SkeletonList";
import ListPaper from "@/components/dashboard/lists/ListPaper";
import FloatingAddButton from "@/components/layout/FloatingAddButton";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loadingItems, setLoadingItems] = useState(true);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { addLog } = useAuditLog();
  const { role, loading: roleLoading } = useMemberRole(user?.id);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isGuest = role === "guest";

  // 🔒 Redirect if unauthenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // 🔄 Fetch maintenance items
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    setLoadingItems(true);
    fetch("/api/maintenance")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setItems(data))
      .catch((err) => {
        console.error("Failed to fetch:", err);
        setSnackbar({
          open: true,
          message: "Failed to load items.",
          severity: "error",
        });
      })
      .finally(() => setLoadingItems(false));
  }, [isLoaded, isSignedIn, setItems]);

  // ➕ Add or update item
  const handleAddItem = async (item: Omit<MaintenanceItem, "id">) => {
    if (isGuest) return;

    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = { ...items[editingIndex], ...item };
      setItems(updated);
      setEditingIndex(null);

      const id = items[editingIndex].id;
      if (isSignedIn && id) {
        await fetch("/api/maintenance/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...item }),
        });
        setSnackbar({
          open: true,
          message: `Item updated: ${item.title}`,
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
      setSnackbar({
        open: true,
        message: `Item added: ${item.title}`,
        severity: "success",
      });

      await addLog({
        action: "Added maintenance",
        itemType: "Maintenance",
        itemName: savedItem.title,
        userId: user?.id || "unknown",
        userName: user?.firstName || "Unknown",
      });
    } else {
      setItems((prev) => [...prev, item]);
    }
  };

  // ✅ Remove item (with undo)
  const handleItemClick = (index: number) => {
    if (isGuest) return;

    const itemToRemove = items[index];
    const deletedId = itemToRemove.id!;
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);

    const itemAbortMap: Record<string, boolean> = {};
    const action = (key: SnackbarKey) => (
      <Button
        size="small"
        onClick={() => {
          setItems((prev) => {
            const restored = [...prev];
            restored.splice(index, 0, itemToRemove);
            return restored;
          });
          itemAbortMap[deletedId] = true;
          closeSnackbar(key);
        }}
      >
        Undo
      </Button>
    );

    enqueueSnackbar("Item deleted", {
      variant: "info",
      action,
      autoHideDuration: 3500,
      anchorOrigin: { horizontal: "center", vertical: "top" },
    });

    setTimeout(async () => {
      if (!itemAbortMap[deletedId]) {
        try {
          await fetch("/api/maintenance/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deletedId }),
          });

          await addLog({
            action: "Completed maintenance",
            itemType: "Maintenance",
            itemName: itemToRemove.title,
            userId: user?.id || "unknown",
            userName: user?.firstName || "Unknown",
          });

          setSnackbar({
            open: true,
            message: `Item permanently deleted: ${itemToRemove.title}`,
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

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.droppableId !== destination.droppableId) return;

    const grouped = groupBy(items, "category");
    const categoryItems = grouped[source.droppableId];

    const [moved] = categoryItems.splice(source.index, 1);
    categoryItems.splice(destination.index, 0, moved);

    const reordered = Object.values(grouped).flat();
    setItems(reordered);

    const orderedIds = reordered.map((item) => item.id).filter(Boolean);

    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error("Failed to persist drag-and-drop order:", err);
      setSnackbar?.({
        open: true,
        message: "Failed to save new order.",
        severity: "error",
      });
    }
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

      {!isGuest && (
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
