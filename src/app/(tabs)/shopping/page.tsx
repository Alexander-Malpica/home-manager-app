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

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}

const categories = ["Groceries", "Cleaning", "Household", "Other"];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const handleAdd = () => {
    if (!name || !category) return;
    setItems([...items, { id: Date.now(), name, category, checked: false }]);
    setName("");
    setCategory("");
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
        🛒 Shopping List
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
                  primary={`${item.name} (${item.category})`}
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
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
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
