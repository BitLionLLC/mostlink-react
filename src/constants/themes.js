import { createTheme } from "@mui/material/styles";

export const lightTheme = {
  bodyColor: "#F3F4F8",
  color: "#111827",
  headerColor: "#ffffff",
  menuColor: "#ffffff",
  landingBackground: "black",
  landingCardBackground: "rgba(200, 200, 200, 0.3)",
  accentColor: "#4f46e5",
  loggedInColor: "#4f46e5",
  sitesBoxColor: "#ffffff",
  editTrayBackground: "#f8fafc",
};

export const darkTheme = {
  bodyColor: "#0d1117",
  color: "#e2e8f0",
  headerColor: "#0f172a",
  menuColor: "#1e293b",
  landingBackground: "black",
  landingCardBackground: "rgba(34, 34, 34, 0.5)",
  accentColor: "#818cf8",
  loggedInColor: "#818cf8",
  sitesBoxColor: "#0f172a",
  editTrayBackground: "#0f172a",
};

export const muiDarkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const muiLightTheme = createTheme({
  palette: {
    mode: "light",
  },
});
