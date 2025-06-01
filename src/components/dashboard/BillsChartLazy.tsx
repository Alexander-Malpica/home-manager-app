"use client";

import { Box, Typography, Paper } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "@mui/material/styles"; // ✅ Use MUI theme hook

interface Props {
  data: { month: string; total: number; paid: number }[];
}

export default function BillsChartLazy({ data }: Props) {
  const theme = useTheme(); // ✅ Get dynamic theme (light or dark)

  return (
    <Box>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
      >
        Monthly Expenses
      </Typography>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="total"
              name="Total Bills"
              fill={theme.palette.primary.main} // ✅ Dynamically styled
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
