import { createTheme, ThemeOptions } from '@mui/material/styles'

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Manrope", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
}

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    ...baseOptions,
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#4caf50' : '#2e7d32',
        light: '#81c784',
        dark: '#1b5e20',
      },
      secondary: { main: '#81c784' },
      background: {
        default: mode === 'dark' ? '#121212' : '#f8f9fa',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
  })

export const theme = createAppTheme('light')
