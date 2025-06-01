import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function EmptyState({ message }: { message: string }) {
  return (
    <Box
      textAlign="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={5}
    >
      <Image
        src="/empty.svg"
        alt="Empty"
        width={120}
        height={120}
        style={{ opacity: 0.6 }}
      />
      <Typography variant="h6" mt={2} color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
