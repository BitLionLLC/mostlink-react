import { createTheme } from "@mui/material/styles";

export const lightTheme = {
  bodyColor: "#EEEEEE",
  color: "#001036",
  headerColor: "lightblue",
  menuColor: "#E8EEF5",
  landingBackground: "black",
  landingCardBackground: "rgba(200, 200, 200, 0.3)",
  accentColor: "blue",
  loggedInColor: "#1d4ed8",
  sitesBoxColor: "lightblue",
  editTrayBackground: "#EEE",
};

export const darkTheme = {
  bodyColor: "#111111",
  color: "white",
  headerColor: "midnightblue",
  menuColor: "#1e293b",
  landingBackground: "black",
  landingCardBackground: "rgba(34, 34, 34, 0.5)",
  accentColor: "dodgerblue",
  loggedInColor: "#93c5fd",
  sitesBoxColor: "midnightblue",
  editTrayBackground: "#111122",
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
