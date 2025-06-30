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

const summaryItemsConfig = (counts: Props["counts"]) => [
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

export default function SummaryCards({ counts }: Props) {
  const summaryItems = summaryItemsConfig(counts);

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {summaryItems.map(({ label, value, icon }) => (
        <Grid key={label} item xs={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: "center",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box display="flex" justifyContent="center" mb={1}>
              {icon}
            </Box>
            <Typography variant="h6" fontWeight="medium">
              {label}
            </Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
