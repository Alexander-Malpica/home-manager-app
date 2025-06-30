"use client";

import { Fab, SxProps, Theme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { MouseEventHandler } from "react";

interface Props {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const fabStyle: SxProps<Theme> = {
  position: "fixed",
  bottom: 90,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1300,
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
