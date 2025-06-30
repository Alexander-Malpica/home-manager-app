"use client";

import {
  Box,
  Typography,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Skeleton,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSnackbar, SnackbarKey } from "notistack";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import ListPaper from "@/components/dashboard/lists/ListPaper";
import FloatingAddButton from "@/components/layout/FloatingAddButton";
import AddChoreModal from "@/components/modals/AddChoreModal";
import EmptyState from "@/components/shared/EmptyState";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import useAuditLog from "@/app/hooks/useAuditLog";
import { useMemberRole } from "@/app/hooks/useMemberRole";
import ListSkeleton from "@/components/shared/SkeletonList";

interface ChoresItem {
  createdAt?: string | number | Date;
  id?: string;
  name: string;
  assignee: string;
  recurrence: string;
  description: string;
  checked?: boolean;
}

function toPascalCase(str: string): string {
  return str
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

export default function ChoresPage() {
  const [items, setItems] = useLocalStorage<ChoresItem[]>("choresItems", []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "assigned">("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loadingItems, setLoadingItems] = useState(true);

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { role, loading: roleLoading } = useMemberRole(user?.id);
  const { addLog } = useAuditLog();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isGuest = role === "guest";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    setLoadingItems(true);
    fetch("/api/chores")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setSnackbar({
          open: true,
          message: "Failed to load items.",
          severity: "error",
        });
      })
      .finally(() => setLoadingItems(false));
  }, [isLoaded, isSignedIn, setItems]);

  const handleAddItem = async (item: Omit<ChoresItem, "id">) => {
    if (isGuest) return;

    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = { ...items[editingIndex], ...item };
      setItems(updated);
      setEditingIndex(null);

      if (items[editingIndex].id && isSignedIn) {
        await fetch("/api/chores/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: items[editingIndex].id, ...item }),
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
      const res = await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const savedItem = await res.json();
      setItems((prev) => [...prev, savedItem]);
      setSnackbar({ open: true, message: "Item added.", severity: "success" });

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

  const handleItemClick = async (index: number) => {
    if (isGuest) return;

    const itemToRemove = items[index];
    const deletedId = itemToRemove.id;
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
          itemAbortMap[deletedId!] = true;
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
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });

    setTimeout(async () => {
      if (deletedId && !itemAbortMap[deletedId]) {
        try {
          await fetch("/api/chores/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deletedId }),
          });

          await addLog({
            action: "Completed chore",
            itemType: "chore",
            itemName: itemToRemove.name,
            userId: user?.id || "unknown",
            userName: user?.firstName || "Unknown",
          });

          setSnackbar({
            open: true,
            message: "Item deleted.",
            severity: "success",
          });
        } catch {
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
    if (!result.destination) return;
    const newItems = [...items];
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    setItems(newItems);
  };

  const filteredItems = items.filter((item) =>
    filter === "assigned"
      ? item.assignee.toLowerCase() === user?.fullName?.toLowerCase()
      : true
  );

  const showEmpty = filteredItems.length === 0;
  if (!isLoaded || !isSignedIn || roleLoading) return <ListSkeleton />;

  return (
    <Container sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight="bold">
          🧹 Chores
        </Typography>
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
        <EmptyState message="No chores yet. Tap + to add one!" />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chores-list">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                display="flex"
                flexDirection="column"
                gap={1}
              >
                {filteredItems.map((item, index) => (
                  <Draggable
                    key={item.id || `${index}`}
                    draggableId={item.id || `${index}`}
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
                          onItemClick={() => handleItemClick(index)}
                          onEditClick={() => handleEditClick(index)}
                          renderItemText={(item) => (
                            <ListItemText
                              primary={item.name}
                              secondary={`Assigned to: ${toPascalCase(
                                item.assignee
                              )} • ${item.description}`}
                              sx={{
                                textDecoration: item.checked
                                  ? "line-through"
                                  : "none",
                                color: item.checked ? "gray" : "inherit",
                              }}
                            />
                          )}
                        />
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {!isGuest && <FloatingAddButton onClick={() => setModalOpen(true)} />}

      <AddChoreModal
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
