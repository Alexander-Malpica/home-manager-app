"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

// ✅ Lazy-load the full chart and show spinner while loading
const BillsChartLazy = dynamic(() => import("./BillsChartLazy"), {
  ssr: false,
  loading: () => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={300}
    >
      <CircularProgress />
    </Box>
  ),
});

export default BillsChartLazy;
