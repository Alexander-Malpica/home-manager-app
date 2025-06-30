"use client";

import { Box, Skeleton, Container } from "@mui/material";

interface ListSkeletonProps {
  count?: number;
}

export default function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 100px)", // adjust if there's a header
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" gap={2} width="100%">
          {Array.from({ length: count }, (_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              animation="wave"
              height={80}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
