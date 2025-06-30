import { Typography, Box } from "@mui/material";

interface Props {
  name: string;
  greeting: string;
  date: string;
}

const toPascalCase = (input: string) =>
  input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default function DashboardHeader({ name, greeting, date }: Props) {
  return (
    <Box mb={3} px={{ xs: 2, sm: 3 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
      >
        {greeting}, {toPascalCase(name)}!
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
      >
        {date}
      </Typography>
    </Box>
  );
}
