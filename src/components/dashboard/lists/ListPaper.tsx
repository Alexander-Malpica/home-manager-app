"use client";

import {
  Paper,
  List,
  ListItem,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();
  // const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "transparent",
      }}
    >
      <List sx={{ p: 0 }}>
        {items.map((item, i) => (
          <ListItem
            key={i}
            onClick={() => onItemClick(i)}
            sx={{
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              mb: i !== items.length - 1 ? 1.5 : 0,
              px: 2,
              py: 1.5,
              bgcolor: theme.palette.background.paper,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box flex="1">{renderItemText(item)}</Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(i);
              }}
              color="inherit"
            >
              <EditIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
