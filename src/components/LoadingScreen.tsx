import { Box, CircularProgress } from "@mui/material";

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={60} thickness={5} color="primary" />
    </Box>
  );
}
