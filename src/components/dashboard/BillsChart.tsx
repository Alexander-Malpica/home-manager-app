"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

// Lazy-load the BillsChart component with a centered loading spinner
const BillsChartLazy = dynamic(() => import("./BillsChartLazy"), {
  ssr: false,
  loading: () => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={300}
    >
      <CircularProgress />
    </Box>
  ),
});

export default BillsChartLazy;
