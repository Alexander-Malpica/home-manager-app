"use client";

import {
  Box,
  Typography,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import { useState } from "react";

const summaryItems = [
  {
    label: "Total Expenses",
    value: 0,
    icon: <AttachMoneyIcon fontSize="medium" color="primary" />,
  },
  {
    label: "Unpaid Bills",
    value: 0,
    icon: <ReceiptIcon fontSize="medium" color="primary" />,
  },
  {
    label: "Pending Chores",
    value: 0,
    icon: <CleaningServicesIcon fontSize="medium" color="primary" />,
  },
  {
    label: "Shopping Items",
    value: 0,
    icon: <ShoppingCartIcon fontSize="medium" color="primary" />,
  },
  {
    label: "Maintenance Tasks",
    value: 0,
    icon: <BuildIcon fontSize="medium" color="primary" />,
  },
];

export default function DashboardPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 7 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={2}>
          {summaryItems.map((item, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
              <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                <Box>{item.icon}</Box>
                <Typography variant="h6" color="primary">
                  {item.value}
                </Typography>
                <Typography variant="body2">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box mt={4}>
          <Typography variant="h6">Monthly Expenses</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            No expense data to display.
          </Typography>
        </Box>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation
          showLabels
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
        >
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction
            label="Shopping"
            icon={<ShoppingCartIcon />}
          />
          <BottomNavigationAction label="Bills" icon={<ReceiptIcon />} />
          <BottomNavigationAction
            label="Chores"
            icon={<CleaningServicesIcon />}
          />
          <BottomNavigationAction label="Maintenance" icon={<BuildIcon />} />
        </BottomNavigation>
      </Box>
    </Box>
  );
}
