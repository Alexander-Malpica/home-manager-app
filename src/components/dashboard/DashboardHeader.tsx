import { Typography, Box } from "@mui/material";

interface Props {
  name: string;
  greeting: string;
  date: string;
}

export default function DashboardHeader({ name, greeting, date }: Props) {
  return (
    <Box mb={3}>
      <Typography variant="h4" gutterBottom>
        {greeting}, {name}!
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {date}
      </Typography>
    </Box>
  );
}
