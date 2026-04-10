import { Box } from '@mui/material'
import { COLORS } from '@styles/theme'

export default function Layout({ children }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100svh',
        background: COLORS.black,
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Noise texture overlay */}
      <Box
        sx={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          opacity: 0.3,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
