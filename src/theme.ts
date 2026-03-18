import { createTheme, ThemeOptions } from '@mui/material/styles'

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Manrope", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.02em' },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400, fontSize: '0.875rem' },
    caption: { fontWeight: 500, fontSize: '0.75rem' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 20, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: '50%' },
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
        main: mode === 'dark' ? '#7fb88a' : '#2d5f3f',
        light: '#7fb88a',
        dark: '#1a3d2a',
      },
      secondary: { main: '#7fb88a' },
      background: {
        default: mode === 'dark' ? '#161a17' : '#f7f5f0',
        paper: mode === 'dark' ? '#1e2320' : '#f7f5f0',
      },
    },
  })

export const theme = createAppTheme('light')
