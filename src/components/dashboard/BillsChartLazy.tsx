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
import theme from "@/theme/theme";

interface Props {
  data: { month: string; total: number; paid: number }[];
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
            <Legend />
            <Bar
              dataKey="total"
              name="Total Bills"
              fill={theme.palette.primary.main}
            />
            {/* <Bar
              dataKey="paid"
              name="Paid Bills"
              fill={theme.palette.success.main}
            /> */}
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
