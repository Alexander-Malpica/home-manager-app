import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";

interface Props {
  counts: {
    bills: number;
    chores: number;
    shopping: number;
    maintenance: number;
  };
}

export default function SummaryCards({ counts }: Props) {
  const summaryItems = [
    {
      label: "Shopping Items",
      value: counts.shopping,
      icon: <ShoppingCartIcon fontSize="medium" color="primary" />,
    },
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
      label: "Maintenance Tasks",
      value: counts.maintenance,
      icon: <BuildIcon fontSize="medium" color="primary" />,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {summaryItems.map((item, index) => (
        <Grid key={index} item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: "center",
              height: "100%", // ✅ ensures uniform height
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box display="flex" justifyContent="center" mb={1}>
              {item.icon}
            </Box>
            <Typography variant="h6">{item.label}</Typography>
            <Typography variant="h4" color="primary">
              {item.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
