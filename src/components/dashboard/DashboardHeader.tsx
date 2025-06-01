
import { Typography, Box } from "@mui/material";

interface Props {
  name: string;
  greeting: string;
  date: string;
}

export default function DashboardHeader({ name, greeting, date }: Props) {
  return (
    <Box mb={3} px={{ xs: 2, sm: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
      >
        {greeting}, {name}!
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
      >
        {date}
      </Typography>
    </Box>
  );
}
