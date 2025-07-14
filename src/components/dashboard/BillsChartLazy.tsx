"use client";

import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  data: { month: string; total: number; paid: number }[];
}

export default function BillsChartLazy({ data }: Props) {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
      >
        Monthly Expenses
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis dataKey="amount ($)" />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="total"
              name="Total Bills"
              fill={theme.palette.primary.main}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
