"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import theme from "@/theme/theme";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
      ? "Good afternoon"
      : "Good evening";
  const formattedDate = format(now, "EEEE, MMMM d, yyyy");

  const [counts, setCounts] = useState({
    bills: 0,
    chores: 0,
    shopping: 0,
    maintenance: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    async function fetchCounts() {
      const endpoints = {
        bills: "/api/bills/count",
        chores: "/api/chores/count",
        shopping: "/api/shopping/count",
        maintenance: "/api/maintenance/count",
      };

      const data = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          const res = await fetch(url);
          const json = await res.json();
          return [key, json.count];
        })
      );
      setCounts(Object.fromEntries(data));
    }

    async function fetchMonthly() {
      const res = await fetch("/api/bills/monthly");
      const json = await res.json();
      setMonthlyData(json);
    }

    fetchCounts();
    fetchMonthly();
  }, []);

  const summaryItems = [
    {
      label: "Unpaid Bills",
      value: counts.bills,
      icon: <ReceiptIcon fontSize="medium" color="primary" />,
    },
    {
      label: "Pending Chores",
      value: counts.chores,
      icon: <CleaningServicesIcon fontSize="medium" color="primary" />,
    },
    {
      label: "Shopping Items",
      value: counts.shopping,
      icon: <ShoppingCartIcon fontSize="medium" color="primary" />,
    },
    {
      label: "Maintenance Tasks",
      value: counts.maintenance,
      icon: <BuildIcon fontSize="medium" color="primary" />,
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          mx: "auto",
          overflowY: "auto",
          minHeight: "100dvh",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {greeting}, {firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {formattedDate}
        </Typography>

        <Typography variant="h4" gutterBottom mt={2}>
          Overview
        </Typography>
        <Grid container spacing={2}>
          {summaryItems.map((item, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: theme.palette.background.paper,
                  border: "2px ridge #f0f0f0",
                  textWrap: "nowrap",
                }}
              >
                <Box>{item.icon}</Box>
                <Typography variant="h6" color="text.primary">
                  {item.value}
                </Typography>
                <Typography variant="body1">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Monthly Expenses
          </Typography>

          {monthlyData.length === 0 ? (
            <Typography variant="h6" color="text.secondary">
              No expense data to display.
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}
