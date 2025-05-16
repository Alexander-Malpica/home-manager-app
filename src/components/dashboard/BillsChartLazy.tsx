"use client";

import { Box, Typography, Paper } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import theme from "@/theme/theme";

interface Props {
  data: { month: string; total: number }[];
}

export default function BillsChartLazy({ data }: Props) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Monthly Expenses
      </Typography>
      <Paper sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
