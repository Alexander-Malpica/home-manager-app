"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={5}
    >
      <Image
        src="/empty.svg"
        alt="Empty state illustration"
        width={120}
        height={120}
        style={{ opacity: 0.6 }}
        priority
      />
      <Typography variant="h6" mt={2} color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
