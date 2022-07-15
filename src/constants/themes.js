import { createTheme } from '@mui/material/styles';

export const lightTheme = {
  bodyColor: 'white',
  color: '#001036',
  headerColor: 'lightblue',
  menuColor: 'lightgreen',
  landingBackground: 'linear-gradient(to top, #e66465, lightblue)',
  landingCardBackground: 'rgba(255, 255, 255, 0.3)',
  accentColor: 'blue',
  loggedInColor: 'green',
  sitesBoxColor: 'lightblue',
  editTrayBackground: 'slateblue'
}

export const darkTheme = {
  bodyColor: '#222222',
  color: 'white',
  headerColor: '#191970',
  menuColor: '#054A05',
  landingBackground: 'linear-gradient(to top, darkred, midnightblue)',
  landingCardBackground: 'rgba(34, 34, 34, 0.3)',
  accentColor: 'dodgerblue',
  loggedInColor: 'lightgreen',
  sitesBoxColor: 'midnightblue',
  editTrayBackground: '#111122'
}

export const muiDarkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const  muiLightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});