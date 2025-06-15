// components/loaders/ListSkeleton.tsx
import { Box, Skeleton } from "@mui/material";

export default function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      minHeight="calc(100vh - 64px - 72px)" // viewport minus header & footer
      px={2}
    >
      {[...Array(count)].map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rectangular"
          height={80}
          width="100%"
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
  );
}
