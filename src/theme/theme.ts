import { createTheme, ThemeOptions } from "@mui/material/styles";

const commonTypography: ThemeOptions["typography"] = {
  fontFamily: "Roboto, sans-serif",
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2B6CB0" },
    secondary: { main: "#63B3ED" },
    background: {
      default: "#EBF8FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A202C",
      secondary: "#4A5568",
    },
    info: { main: "#805AD5" },
  },
  typography: commonTypography,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#63B3ED" },
    secondary: { main: "#2B6CB0" },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0BEC5",
    },
    info: { main: "#BB86FC" },
  },
  typography: commonTypography,
});
