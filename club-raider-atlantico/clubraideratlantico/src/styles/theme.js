import { createTheme } from '@mui/material/styles'

/**
 * Paleta extraída del logo Club Raider Atlántico:
 * Rojo bandera:   #CC2222
 * Amarillo:       #E8B800
 * Azul Colombia:  #003DA5
 * Negro profundo: #0A0A0A
 * Blanco hueso:   #F0EDE8
 */
export const COLORS = {
  red:    '#CC2222',
  redHot: '#E02828',
  yellow: '#E8B800',
  blue:   '#003DA5',
  black:  '#0A0A0A',
  dark1:  '#111111',
  dark2:  '#181818',
  dark3:  '#222222',
  border: '#2A2A2A',
  muted:  '#7A726A',
  light:  '#B0A89E',
  white:  '#F0EDE8',
}

export const FONTS = {
  display: "'Bebas Neue', sans-serif",
  condensed: "'Barlow Condensed', sans-serif",
  body: "'Barlow', sans-serif",
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: COLORS.red,
      light: COLORS.redHot,
      dark: '#A01A1A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: COLORS.yellow,
      contrastText: COLORS.black,
    },
    background: {
      default: COLORS.black,
      paper: COLORS.dark1,
    },
    text: {
      primary: COLORS.white,
      secondary: COLORS.light,
      disabled: COLORS.muted,
    },
    divider: COLORS.border,
  },
  typography: {
    fontFamily: FONTS.body,
    h1: { fontFamily: FONTS.display, letterSpacing: '0.04em' },
    h2: { fontFamily: FONTS.display, letterSpacing: '0.04em' },
    h3: { fontFamily: FONTS.condensed, fontWeight: 700, letterSpacing: '0.06em' },
    h4: { fontFamily: FONTS.condensed, fontWeight: 600 },
    h5: { fontFamily: FONTS.condensed, fontWeight: 600 },
    h6: { fontFamily: FONTS.condensed, fontWeight: 600 },
    button: {
      fontFamily: FONTS.condensed,
      fontWeight: 700,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    },
    overline: {
      fontFamily: FONTS.condensed,
      letterSpacing: '0.3em',
    },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 32px',
          fontSize: '14px',
          clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
        },
        containedPrimary: {
          background: COLORS.red,
          '&:hover': { background: COLORS.redHot },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: COLORS.border },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2 },
      },
    },
  },
})
