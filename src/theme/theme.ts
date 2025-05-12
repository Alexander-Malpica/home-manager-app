import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2B6CB0", // Blue
    },
    secondary: {
      main: "#63B3ED", // Light Blue
    },
    background: {
      default: "#EBF8FF", // Very Light Blue
      paper: "#FFFFFF", // Card/Dialog background
    },
    text: {
      primary: "#1A202C", // Almost black
      secondary: "#4A5568", // Muted dark gray
    },
    info: {
      main: "#805AD5", // Purple accent
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
  components: {
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: "18px", // or "16px"
        },
        secondary: {
          fontSize: "15px", // or "14px"
        },
      },
    },
  },
});

export default theme;
