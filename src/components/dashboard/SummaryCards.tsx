"use client";

import { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";

const endpoints = {
  bills: "/api/bills/count",
  chores: "/api/chores/count",
  shopping: "/api/shopping/count",
  maintenance: "/api/maintenance/count",
};

export default function SummaryCards() {
  const [counts, setCounts] = useState({
    bills: 0,
    chores: 0,
    shopping: 0,
    maintenance: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      const data = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          const res = await fetch(url);
          const json = await res.json();
          return [key, json.count];
        })
      );
      setCounts(Object.fromEntries(data));
    }

    fetchCounts();
  }, []);

  const items = [
    { label: "Bills", value: counts.bills, icon: <AttachMoneyIcon /> },
    { label: "Chores", value: counts.chores, icon: <CleaningServicesIcon /> },
    { label: "Shopping", value: counts.shopping, icon: <ShoppingCartIcon /> },
    { label: "Maintenance", value: counts.maintenance, icon: <BuildIcon /> },
  ];

  return (
    <Grid container spacing={2}>
      {items.map(({ label, value, icon }) => (
        <Grid item xs={12} sm={6} md={3} key={label}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            {icon}
            <Typography variant="h6">{label}</Typography>
            <Typography variant="body1">{value}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
