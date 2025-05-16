"use client";

import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface Props {
  onClick: () => void;
}

const fabStyle = {
  position: "fixed",
  bottom: 90,
  left: "50%",
  transform: "translateX(-50%)",
};

export default function FloatingAddButton({ onClick }: Props) {
  return (
    <Fab
      color="primary"
      aria-label="Add new item"
      onClick={onClick}
      sx={fabStyle}
    >
      <AddIcon />
    </Fab>
  );
}
