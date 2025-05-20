"use client";

import { Paper, List, ListItem, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { ReactNode } from "react";

type Props<T> = {
  items: T[];
  onItemClick: (index: number) => void;
  onEditClick: (index: number) => void;
  renderItemText: (item: T) => ReactNode;
};

export default function ListPaper<T>({
  items,
  onItemClick,
  onEditClick,
  renderItemText,
}: Props<T>) {
  return (
    <Paper elevation={0} sx={{ bgcolor: "#EBF8FF" }}>
      <List
        sx={{
          minHeight: 200, // ✅ Prevent layout shift on short lists
          p: 1,
        }}
      >
        {items.map((item, i) => (
          <ListItem
            key={i}
            onClick={() => onItemClick(i)}
            sx={{
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "2px solid #707070",
              borderRadius: 1,
              mb: 1,
              bgcolor: "#fff",
            }}
          >
            {renderItemText(item)}

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(i);
              }}
            >
              <EditIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
