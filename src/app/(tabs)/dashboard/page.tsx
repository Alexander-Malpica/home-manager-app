"use client";

import { Box, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import theme from "@/theme/theme";

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
  return (
    <Box sx={{ height: "100dvh", overflow: "hidden" }}>
      <Box sx={{ p: 2, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={2}>
          {summaryItems.map((item, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
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
          <Typography variant="h6" color="text.secondary">
            No expense data to display.
          </Typography>
          {/* Need to add graph of expenses by month */}
        </Box>
      </Box>
    </Box>
  );
}
