// app/components/FloatingAddButton.tsx

"use client";

import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface Props {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: Props) {
  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <AddIcon />
    </Fab>
  );
}
