"use client";

import {
  Box,
  Typography,
  List,
  ListItem,
  Checkbox,
  IconButton,
  ListItemText,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

interface Maintenance {
  id: number;
  name: string;
  category: string;
  description: string;
  checked: boolean;
}

const maintenanceCategories = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Garden",
  "General",
];

export default function ShoppingPage() {
  const [items, setItems] = useState<Maintenance[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!name || !category || !description) return;
    setItems([
      ...items,
      { id: Date.now(), name, category, description, checked: false },
    ]);
    setName("");
    setCategory("");
    setDescription("");
    setModalOpen(false);
  };

  const handleToggle = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🛠️ Maintenance
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">No items in your list.</Typography>
      ) : (
        <Paper>
          <List>
            {items.map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleToggle(item.id)}
                />
                <ListItemText
                  primary={`${item.name}`}
                  secondary=<>
                    <Typography
                      component="span"
                      variant="body2"
                      display="block"
                    >
                      Category: {item.category}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      display="block"
                    >
                      Description: {item.description}
                    </Typography>
                  </>
                  sx={{
                    textDecoration: item.checked ? "line-through" : "none",
                    color: item.checked ? "gray" : "inherit",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setModalOpen(true)}
        sx={{ position: "fixed", bottom: 80, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Add Shopping Item</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Task Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {maintenanceCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
