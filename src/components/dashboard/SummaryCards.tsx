import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import theme from "@/theme/theme";

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
    <Grid container spacing={2} mb={4}>
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
  );
}
